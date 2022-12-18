import { InstrumentSelector } from '@lib/component';
import { timestamp } from '@lib/shared';
import { OrderNotFoundError, State, StateChangeTracker, StoreEvent } from '@lib/store';

export class OrderCancelFailedEvent implements StoreEvent {
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

    if (order.state != 'CANCELING') {
      return;
    }

    order.state = 'PENDING';
    order.timestamp = this.timestamp;

    changes.commit(order);
  }
}
