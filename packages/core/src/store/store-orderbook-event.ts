import { InstrumentSelector, Liquidity, Orderbook } from '@lib/domain';
import { timestamp } from '@lib/shared';
import {
  InstrumentNotSupportedError,
  LiquidationError,
  State,
  StateChangeTracker,
  StoreEvent
} from '@lib/store';

export class OrderbookPatchEvent implements StoreEvent {
  constructor(
    readonly instrument: InstrumentSelector,
    readonly ask: Liquidity,
    readonly bid: Liquidity,
    readonly timestamp: timestamp
  ) {}

  handle(state: State, changes: StateChangeTracker): void {
    const instrument = state.universe.instrument.get(this.instrument.id);
    if (!instrument) {
      throw new InstrumentNotSupportedError(this.instrument);
    }

    const orderbook = state.orderbook.tryGetOrSet(
      this.instrument.id,
      () => new Orderbook(0, instrument, this.ask, this.bid)
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
        throw new LiquidationError();
      }
    }

    changes.commit(orderbook);
  }
}
