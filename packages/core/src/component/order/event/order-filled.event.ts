import { InstrumentSelector } from '@lib/component';
import { decimal, timestamp } from '@lib/shared';
import {
  OrderInvalidStateError,
  OrderNotFoundError,
  State,
  StateChangeTracker,
  StoreEvent
} from '@lib/store';

export class OrderFilledEvent implements StoreEvent {
  constructor(
    readonly id: string,
    readonly instrument: InstrumentSelector,
    readonly averageExecutionRate: decimal,
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

    if (order.state != 'PENDING' && order.state != 'CANCELING') {
      throw new OrderInvalidStateError(order.state, ['PENDING', 'CANCELING']);
    }

    order.state = 'FILLED';
    order.timestamp = this.timestamp;
    order.quantityExecuted = order.quantity;
    order.averageExecutionRate = this.averageExecutionRate;

    changes.commit(order);
  }
}
