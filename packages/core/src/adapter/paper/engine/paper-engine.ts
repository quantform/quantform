import { tap } from 'rxjs';

import { Order, Orderbook, Trade } from '../../../domain';
import { d, decimal } from '../../../shared';
import {
  BalancePatchEvent,
  OrderCanceledEvent,
  OrderCancelingEvent,
  OrderFilledEvent,
  OrderNewEvent,
  OrderPendingEvent,
  Store
} from '../../../store';
import { balanceNotFoundError, instrumentNotSupportedError } from '../../../store/error';

export class PaperEngine {
  constructor(private readonly store: Store) {
    store.changes$
      .pipe(
        tap(it => {
          if (it instanceof Orderbook) {
            this.onOrderbook(it);
          } else if (it instanceof Trade) {
            this.onTrade(it);
          }
        })
      )
      .subscribe();
  }

  public execute(order: Order) {
    const { timestamp } = this.store.snapshot;

    this.store.dispatch(new OrderPendingEvent(order.id, order.instrument, timestamp));
  }

  public cancel(order: Order) {
    const { timestamp } = this.store.snapshot;

    this.store.dispatch(new OrderCancelingEvent(order.id, order.instrument, timestamp));
    this.store.dispatch(new OrderCanceledEvent(order.id, order.instrument, timestamp));
  }

  private onOrderbook(orderbook: Orderbook) {
    const orders = this.store.snapshot.order.get(orderbook.instrument.id);
    if (!orders) {
      return;
    }

    orders.asReadonlyArray().forEach(it => {
      if (it.state != 'PENDING') {
        return;
      }

      if (it.rate) {
        if (it.quantity.greaterThan(0) && it.rate.greaterThan(orderbook.asks.rate)) {
          this.completeOrder(it, orderbook.asks.rate);
        } else if (it.quantity.lessThan(0) && it.rate.lessThan(orderbook.bids.rate)) {
          this.completeOrder(it, orderbook.bids.rate);
        }
      } else {
        if (it.quantity.greaterThan(0)) {
          this.completeOrder(it, orderbook.asks.rate);
        } else if (it.quantity.lessThan(0)) {
          this.completeOrder(it, orderbook.bids.rate);
        }
      }
    });
  }

  private onTrade(trade: Trade) {
    const orders = this.store.snapshot.order.get(trade.instrument.id);
    if (!orders) {
      return;
    }

    orders.asReadonlyArray().forEach(it => {
      if (it.state != 'PENDING') {
        return;
      }

      if (it.rate) {
        if (it.quantity.greaterThan(0) && it.rate.greaterThan(trade.rate)) {
          this.completeOrder(it, trade.rate);
        } else if (it.quantity.lessThan(0) && it.rate.lessThan(trade.rate)) {
          this.completeOrder(it, trade.rate);
        }
      } else {
        this.completeOrder(it, trade.rate);
      }
    });
  }

  private completeOrder(order: Order, averageExecutionRate: decimal) {
    const { timestamp } = this.store.snapshot;

    const instrument = this.store.snapshot.universe.instrument.get(order.instrument.id);
    if (!instrument) {
      throw instrumentNotSupportedError(order.instrument);
    }

    const base = this.store.snapshot.balance.get(order.instrument.base.id);
    if (!base) {
      throw balanceNotFoundError(order.instrument.base);
    }

    const quote = this.store.snapshot.balance.get(order.instrument.quote.id);
    if (!quote) {
      throw balanceNotFoundError(order.instrument.quote);
    }

    const transacted = {
      base: d.Zero,
      quote: d.Zero
    };

    const qty = order.quantity.abs();

    if (order.quantity.greaterThan(0)) {
      transacted.base = transacted.base.plus(
        instrument.base.floor(instrument.commission.applyMakerFee(qty))
      );
      transacted.quote = transacted.quote.minus(
        instrument.quote.floor(averageExecutionRate.mul(qty))
      );
    } else if (order.quantity.lessThan(0)) {
      transacted.base = transacted.base.minus(instrument.base.floor(qty));
      transacted.quote = transacted.quote.plus(
        instrument.quote.floor(
          instrument.commission.applyMakerFee(averageExecutionRate.mul(qty))
        )
      );
    }

    this.store.dispatch(
      new OrderFilledEvent(order.id, order.instrument, averageExecutionRate, timestamp),
      new BalancePatchEvent(
        instrument.base,
        base.free.plus(transacted.base),
        d.Zero,
        timestamp
      ),
      new BalancePatchEvent(
        instrument.quote,
        quote.free.plus(transacted.quote),
        d.Zero,
        timestamp
      )
    );
  }
}
