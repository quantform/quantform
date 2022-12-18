import { InstrumentSelector } from '@lib/component';
import { timestamp } from '@lib/shared';
import {
  BalanceNotFoundError,
  OrderInvalidStateError,
  OrderNotFoundError,
  State,
  StateChangeTracker,
  StoreEvent
} from '@lib/store';

export class OrderRejectedEvent implements StoreEvent {
  constructor(
    readonly id: string,
    readonly instrument: InstrumentSelector,
    readonly timestamp: timestamp
  ) {}

  handle(state: State, changes: StateChangeTracker): void {
    const order = state.order
      .tryGetOrSet(this.instrument.id, () => {
        throw new OrderNotFoundError(this.id);
      })
      .tryGetOrSet(this.id, () => {
        throw new OrderNotFoundError(this.id);
      });

    if (order.state != 'NEW') {
      throw new OrderInvalidStateError(order.state, ['NEW']);
    }

    order.state = 'REJECTED';
    order.timestamp = this.timestamp;

    const base = state.balance.get(order.instrument.base.id);
    const quote = state.balance.get(order.instrument.quote.id);

    if (!base || !quote) {
      throw new BalanceNotFoundError(
        !base ? order.instrument.base : order.instrument.quote
      );
    }

    if (base.tryRemoveTransientFunding(order)) {
      base.timestamp = this.timestamp;

      changes.commit(base);
    }

    if (quote.tryRemoveTransientFunding(order)) {
      quote.timestamp = this.timestamp;

      changes.commit(quote);
    }

    changes.commit(order);
  }
}
