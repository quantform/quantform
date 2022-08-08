import { tap } from 'rxjs';

import { Order, Orderbook, Trade } from '../../../domain';
import { d, decimal } from '../../../shared';
import {
  BalanceLockOrderEvent,
  BalanceTransactEvent,
  BalanceUnlockOrderEvent,
  OrderCanceledEvent,
  OrderCancelingEvent,
  OrderFilledEvent,
  OrderNewEvent,
  OrderPendingEvent,
  OrderRejectedEvent,
  Store
} from '../../../store';

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

  public open(order: Order) {
    const { timestamp } = this.store.snapshot;

    try {
      this.store.dispatch(
        new OrderNewEvent(order, timestamp),
        new BalanceLockOrderEvent(order.id, order.instrument, timestamp)
      );

      this.store.dispatch(new OrderPendingEvent(order.id, order.instrument, timestamp));
    } catch (error) {
      this.store.dispatch(
        new BalanceUnlockOrderEvent(order.id, order.instrument, timestamp),
        new OrderRejectedEvent(order.id, order.instrument, timestamp)
      );
    }
  }

  public cancel(order: Order) {
    const { timestamp } = this.store.snapshot;

    this.store.dispatch(new OrderCancelingEvent(order.id, order.instrument, timestamp));

    this.store.dispatch(
      new BalanceUnlockOrderEvent(order.id, order.instrument, timestamp),
      new OrderCanceledEvent(order.id, order.instrument, timestamp)
    );
  }

  private onOrderbook(orderbook: Orderbook) {
    this.store.snapshot.order
      .get(orderbook.instrument.id)
      .asReadonlyArray()
      .forEach(it => {
        if (it.state != 'PENDING') {
          return;
        }

        if (it.type == 'LIMIT') {
          if (it.quantity.greaterThan(0) && it.rate.greaterThan(orderbook.bestAskRate)) {
            this.completeOrder(it, orderbook.bestAskRate);
          } else if (it.quantity.lessThan(0) && it.rate.lessThan(orderbook.bestBidRate)) {
            this.completeOrder(it, orderbook.bestBidRate);
          }
        } else if (it.type == 'MARKET') {
          if (it.quantity.greaterThan(0)) {
            this.completeOrder(it, orderbook.bestAskRate);
          } else if (it.quantity.lessThan(0)) {
            this.completeOrder(it, orderbook.bestBidRate);
          }
        }
      });
  }

  private onTrade(trade: Trade) {
    this.store.snapshot.order
      .get(trade.instrument.id)
      .asReadonlyArray()
      .forEach(it => {
        if (it.state != 'PENDING') {
          return;
        }

        if (it.type == 'LIMIT') {
          if (it.quantity.greaterThan(0) && it.rate.greaterThan(trade.rate)) {
            this.completeOrder(it, trade.rate);
          } else if (it.quantity.lessThan(0) && it.rate.lessThan(trade.rate)) {
            this.completeOrder(it, trade.rate);
          }
        } else if (it.type == 'MARKET') {
          this.completeOrder(it, trade.rate);
        }
      });
  }

  private completeOrder(order: Order, averageExecutionRate: decimal) {
    const { timestamp } = this.store.snapshot;

    const instrument = this.store.snapshot.universe.instrument.get(order.instrument.id);
    const transacted = {
      base: d(0),
      quote: d(0)
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
      new BalanceUnlockOrderEvent(order.id, order.instrument, timestamp),
      new OrderFilledEvent(order.id, order.instrument, averageExecutionRate, timestamp),
      new BalanceTransactEvent(instrument.base, transacted.base, timestamp),
      new BalanceTransactEvent(instrument.quote, transacted.quote, timestamp)
    );
  }
}
