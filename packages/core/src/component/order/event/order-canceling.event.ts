import { InstrumentSelector } from '@lib/component';
import { timestamp } from '@lib/shared';
import {
  OrderInvalidStateError,
  OrderNotFoundError,
  State,
  StateChangeTracker,
  StoreEvent
} from '@lib/store';

export class OrderCancelingEvent implements StoreEvent {
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

    if (order.state == 'CANCELING' || order.state == 'CANCELED') {
      return;
    }

    if (order.state != 'PENDING') {
      throw new OrderInvalidStateError(order.state, ['PENDING']);
    }

    order.state = 'CANCELING';
    order.timestamp = this.timestamp;

    changes.commit(order);
  }
}
