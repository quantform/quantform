import { InstrumentSelector, Orderbook } from '../domain';
import { timestamp } from '../shared';
import { StoreEvent } from './store.event';
import { State, StateChangeTracker } from './store-state';

export class OrderbookPatchEvent implements StoreEvent {
  constructor(
    readonly instrument: InstrumentSelector,
    readonly bestAskRate: number,
    readonly bestAskQuantity: number,
    readonly bestBidRate: number,
    readonly bestBidQuantity: number,
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
    orderbook.bestAskRate = orderbook.instrument.quote.fixed(this.bestAskRate);
    orderbook.bestAskQuantity = orderbook.instrument.base.fixed(this.bestAskQuantity);
    orderbook.bestBidRate = orderbook.instrument.quote.fixed(this.bestBidRate);
    orderbook.bestBidQuantity = orderbook.instrument.base.fixed(this.bestBidQuantity);

    const quote = state.balance.get(orderbook.instrument.quote.id);

    if (quote) {
      for (const position of Object.values(quote.position)) {
        if (position.instrument.id != orderbook.instrument.id) {
          continue;
        }

        const rate = position.size >= 0 ? orderbook.bestBidRate : orderbook.bestAskRate;

        position.calculateEstimatedUnrealizedPnL(rate);
      }

      if (quote.total < 0) {
        throw new Error('liquidated');
      }
    }

    changes.commit(orderbook);
  }
}
