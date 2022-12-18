import { InstrumentSelector } from '@lib/component';
import { timestamp } from '@lib/shared';
import {
  OrderInvalidStateError,
  OrderNotFoundError,
  State,
  StateChangeTracker,
  StoreEvent
} from '@lib/store';

export class OrderPendingEvent implements StoreEvent {
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

    order.state = 'PENDING';
    order.timestamp = this.timestamp;

    changes.commit(order);
  }
}
