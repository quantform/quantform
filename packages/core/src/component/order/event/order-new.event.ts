import { Order } from '@lib/component';
import { timestamp } from '@lib/shared';
import {
  BalanceNotFoundError,
  InnerSet,
  OrderInvalidStateError,
  State,
  StateChangeTracker,
  StoreEvent
} from '@lib/store';

export class OrderNewEvent implements StoreEvent {
  constructor(readonly order: Order, readonly timestamp: timestamp) {}

  handle(state: State, changes: StateChangeTracker): void {
    if (this.order.state != 'NEW') {
      throw new OrderInvalidStateError(this.order.state, ['NEW']);
    }

    this.order.createdAt = this.timestamp;
    this.order.timestamp = this.timestamp;

    const orderByInstrument = state.order.tryGetOrSet(
      this.order.instrument.id,
      () => new InnerSet<Order>(this.order.instrument.id)
    );

    orderByInstrument.upsert(this.order);

    const base = state.balance.get(this.order.instrument.base.id);
    const quote = state.balance.get(this.order.instrument.quote.id);

    if (!base || !quote) {
      throw new BalanceNotFoundError(
        !base ? this.order.instrument.base : this.order.instrument.quote
      );
    }

    if (base.tryAddTransientFunding(this.order)) {
      base.timestamp = this.timestamp;

      changes.commit(base);
    }

    if (quote.tryAddTransientFunding(this.order)) {
      quote.timestamp = this.timestamp;

      changes.commit(quote);
    }

    changes.commit(this.order);
  }
}
