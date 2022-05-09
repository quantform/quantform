import { tap } from 'rxjs';

import { Order, Orderbook, Trade } from '../../../domain';
import {
  BalanceLockOrderEvent,
  BalancePatchEvent,
  BalanceTransactEvent,
  BalanceUnlockOrderEvent,
  OrderCanceledEvent,
  OrderCancelingEvent,
  OrderFilledEvent,
  OrderNewEvent,
  OrderPendingEvent,
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

    this.store.dispatch(
      new OrderNewEvent(order, timestamp),
      new BalanceLockOrderEvent(order.id, order.instrument, timestamp)
    );

    this.store.dispatch(new OrderPendingEvent(order.id, order.instrument, timestamp));
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
          if (it.quantity > 0 && it.rate > orderbook.bestAskRate) {
            this.completeOrder(it, orderbook.bestAskRate);
          } else if (it.quantity < 0 && it.rate < orderbook.bestBidRate) {
            this.completeOrder(it, orderbook.bestBidRate);
          }
        } else if (it.type == 'MARKET') {
          if (it.quantity > 0) {
            this.completeOrder(it, orderbook.bestAskRate);
          } else if (it.quantity < 0) {
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
          if (it.quantity > 0 && it.rate > trade.rate) {
            this.completeOrder(it, trade.rate);
          } else if (it.quantity < 0 && it.rate < trade.rate) {
            this.completeOrder(it, trade.rate);
          }
        } else if (it.type == 'MARKET') {
          this.completeOrder(it, trade.rate);
        }
      });
  }

  private completeOrder(order: Order, averageExecutionRate: number) {
    const { timestamp } = this.store.snapshot;

    const instrument = this.store.snapshot.universe.instrument.get(order.instrument.id);
    const transacted = {
      base: 0,
      quote: 0
    };

    const qty = Math.abs(order.quantity);

    if (order.quantity > 0) {
      transacted.base += instrument.base.floor(instrument.commission.applyMakerFee(qty));
      transacted.quote -= instrument.quote.floor(averageExecutionRate * qty);
    } else if (order.quantity < 0) {
      transacted.base -= instrument.base.floor(qty);
      transacted.quote += instrument.quote.floor(
        instrument.commission.applyMakerFee(averageExecutionRate * qty)
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
