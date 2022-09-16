import { InstrumentSelector, Trade } from '../domain';
import { d, decimal, timestamp } from '../shared';
import { instrumentNotSubscribedError, instrumentNotSupportedError } from './error';
import { StoreEvent } from './store-event';
import { State, StateChangeTracker } from './store-state';

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
      throw instrumentNotSubscribedError(this.instrument);
    }

    const instrument = state.universe.instrument.get(this.instrument.id);
    if (!instrument) {
      throw instrumentNotSupportedError(this.instrument);
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