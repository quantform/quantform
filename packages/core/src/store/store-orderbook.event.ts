import { InstrumentSelector, Orderbook } from '../domain';
import { decimal, timestamp } from '../shared';
import { StoreEvent } from './store.event';
import { State, StateChangeTracker } from './store-state';

export class OrderbookPatchEvent implements StoreEvent {
  constructor(
    readonly instrument: InstrumentSelector,
    readonly bestAskRate: decimal,
    readonly bestAskQuantity: decimal,
    readonly bestBidRate: decimal,
    readonly bestBidQuantity: decimal,
    readonly timestamp: timestamp
  ) {}

  handle(state: State, changes: StateChangeTracker): void {
    if (!state.subscription.instrument.get(this.instrument.id)) {
      throw new Error(`Trying to patch unsubscribed instrument: ${this.instrument.id}`);
    }

    const orderbook = state.orderbook.tryGetOrSet(
      this.instrument.id,
      () => new Orderbook(state.universe.instrument.get(this.instrument.id))
    );

    state.timestamp = this.timestamp;

    orderbook.timestamp = this.timestamp;
    orderbook.bestAskRate = orderbook.instrument.quote.floor(this.bestAskRate);
    orderbook.bestAskQuantity = orderbook.instrument.base.floor(this.bestAskQuantity);
    orderbook.bestBidRate = orderbook.instrument.quote.floor(this.bestBidRate);
    orderbook.bestBidQuantity = orderbook.instrument.base.floor(this.bestBidQuantity);

    const quote = state.balance.get(orderbook.instrument.quote.id);

    if (quote) {
      for (const position of Object.values(quote.position)) {
        if (position.instrument.id != orderbook.instrument.id) {
          continue;
        }

        const rate = position.size.greaterThanOrEqualTo(0)
          ? orderbook.bestBidRate
          : orderbook.bestAskRate;

        position.calculateEstimatedUnrealizedPnL(rate);
      }

      if (quote.total.lessThan(0)) {
        throw new Error('You have been liquidated.');
      }
    }

    changes.commit(orderbook);
  }
}
