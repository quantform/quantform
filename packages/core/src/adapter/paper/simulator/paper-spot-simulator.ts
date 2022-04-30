import { Order } from '../../../domain';
import { timestamp } from '../../../shared';
import {
  BalanceFreezEvent,
  BalanceTransactEvent,
  BalanceUnfreezEvent,
  OrderCanceledEvent,
  OrderCancelingEvent,
  OrderFilledEvent,
  OrderNewEvent,
  OrderPendingEvent
} from '../../../store';
import { PaperAdapter } from '..';
import { PaperSimulator } from './paper-simulator';

export class PaperSpotSimulator extends PaperSimulator {
  constructor(readonly adapter: PaperAdapter) {
    super(adapter);
  }

  onOrderOpened(order: Order) {
    const timestamp = this.adapter.timestamp();

    this.adapter.store.dispatch(
      ...this.caluclateFreezAllocation(order, timestamp),
      new OrderNewEvent(order, timestamp)
    );
    this.adapter.store.dispatch(
      new OrderPendingEvent(order.id, order.instrument, timestamp)
    );
  }

  onOrderCompleted(order: Order, averageExecutionRate: number, timestamp: timestamp) {
    const instrument = this.adapter.store.snapshot.universe.instrument.get(
      order.instrument.id
    );
    const transacted = {
      base: 0,
      quote: 0
    };

    if (order.quantity > 0) {
      transacted.base += instrument.base.floor(
        instrument.commission.applyMakerFee(order.quantity)
      );
      transacted.quote -= instrument.quote.floor(averageExecutionRate * order.quantity);
    } else if (order.quantity < 0) {
      transacted.base -= instrument.base.floor(order.quantity);
      transacted.quote += instrument.quote.floor(
        instrument.commission.applyMakerFee(averageExecutionRate * order.quantity)
      );
    }

    this.adapter.store.dispatch(
      ...this.caluclateUnfreezAllocation(order, timestamp),
      new OrderFilledEvent(order.id, order.instrument, averageExecutionRate, timestamp),
      new BalanceTransactEvent(instrument.base, transacted.base, timestamp),
      new BalanceTransactEvent(instrument.quote, transacted.quote, timestamp)
    );
  }

  onOrderCanceled(order: Order) {
    const timestamp = this.adapter.timestamp();

    this.adapter.store.dispatch(
      new OrderCancelingEvent(order.id, order.instrument, timestamp)
    );
    this.adapter.store.dispatch(
      ...this.caluclateUnfreezAllocation(order, timestamp),
      new OrderCanceledEvent(order.id, order.instrument, timestamp)
    );
  }

  private caluclateFreezAllocation(
    order: Order,
    timestamp: timestamp
  ): BalanceFreezEvent[] {
    const snapshot = this.adapter.store.snapshot;
    const quote = snapshot.balance.get(order.instrument.quote.id);

    if (order.quantity > 0) {
      switch (order.type) {
        case 'MARKET':
          return [new BalanceFreezEvent(order.instrument.quote, quote.free, timestamp)];

        case 'LIMIT':
          return [
            new BalanceFreezEvent(
              order.instrument.quote,
              quote.asset.ceil(order.rate * order.quantity),
              timestamp
            )
          ];
      }
    }

    if (order.quantity < 0) {
      return [new BalanceFreezEvent(order.instrument.base, order.quantity, timestamp)];
    }
  }

  private caluclateUnfreezAllocation(
    order: Order,
    timestamp: timestamp
  ): BalanceUnfreezEvent[] {
    const snapshot = this.adapter.store.snapshot;
    const quote = snapshot.balance.get(order.instrument.quote.id);

    if (order.quantity > 0) {
      switch (order.type) {
        case 'MARKET':
          return [
            new BalanceUnfreezEvent(order.instrument.quote, quote.locked, timestamp)
          ];

        case 'LIMIT':
          return [
            new BalanceUnfreezEvent(
              order.instrument.quote,
              quote.asset.ceil(order.rate * order.quantity),
              timestamp
            )
          ];
      }
    } else if (order.quantity < 0) {
      return [new BalanceUnfreezEvent(order.instrument.base, order.quantity, timestamp)];
    }
  }
}
