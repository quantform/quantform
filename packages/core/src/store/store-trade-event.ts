import { InstrumentSelector, Trade } from '@lib/domain';
import { d, decimal, timestamp } from '@lib/shared';
import {
  InstrumentNotSubscribedError,
  InstrumentNotSupportedError,
  State,
  StateChangeTracker,
  StoreEvent
} from '@lib/store';

/**
 * Patches a store with specific event @see TradePatchEvent
 * If there is no specific @see Trade in store, it will create a new one.
 */
export class TradePatchEvent implements StoreEvent {
  constructor(
    readonly instrument: InstrumentSelector,
    readonly rate: decimal,
    readonly quantity: decimal,
    readonly timestamp: timestamp
  ) {}

  handle(state: State, changes: StateChangeTracker): void {
    if (!state.subscription.instrument.get(this.instrument.id)) {
      throw new InstrumentNotSubscribedError(this.instrument);
    }

    const instrument = state.universe.instrument.get(this.instrument.id);
    if (!instrument) {
      throw new InstrumentNotSupportedError(this.instrument);
    }

    const trade = state.trade.tryGetOrSet(
      this.instrument.id,
      () => new Trade(0, instrument, d.Zero, d.Zero)
    );

    state.timestamp = this.timestamp;

    trade.timestamp = this.timestamp;
    trade.rate = trade.instrument.quote.floor(this.rate);
    trade.quantity = trade.instrument.base.floor(this.quantity);

    changes.commit(trade);
  }
}
