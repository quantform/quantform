import { Order } from '@lib/component';
import { timestamp } from '@lib/shared';
import { InnerSet, State, StoreEvent } from '@lib/store';

/**
 * Patches a store with an existing pending order.
 * No store changing events are propagated.
 */
export class OrderLoadEvent implements StoreEvent {
  constructor(readonly order: Order, readonly timestamp: timestamp) {}

  handle(state: State): void {
    this.order.timestamp = this.timestamp;

    const orderByInstrument = state.order.tryGetOrSet(
      this.order.instrument.id,
      () => new InnerSet<Order>(this.order.instrument.id)
    );

    orderByInstrument.upsert(this.order);
  }
}
