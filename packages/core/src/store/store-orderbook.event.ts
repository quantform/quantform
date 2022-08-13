import { InstrumentSelector, Liquidity, Orderbook } from '../domain';
import { timestamp } from '../shared';
import { StoreEvent } from './store.event';
import { State, StateChangeTracker } from './store-state';

export class OrderbookPatchEvent implements StoreEvent {
  constructor(
    readonly instrument: InstrumentSelector,
    readonly ask: Liquidity,
    readonly bid: Liquidity,
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
    orderbook.asks = this.ask;
    orderbook.bids = this.bid;

    const quote = state.balance.get(orderbook.instrument.quote.id);

    if (quote) {
      for (const position of Object.values(quote.position)) {
        if (position.instrument.id != orderbook.instrument.id) {
          continue;
        }

        const rate = position.size.greaterThanOrEqualTo(0)
          ? orderbook.bids.rate
          : orderbook.asks.rate;

        if (rate) {
          position.calculateEstimatedUnrealizedPnL(rate);
        }
      }

      if (quote.total.lessThan(0)) {
        throw new Error('You have been liquidated.');
      }
    }

    changes.commit(orderbook);
  }
}
