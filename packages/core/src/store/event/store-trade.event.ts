import { Trade } from '../../domain';
import { InstrumentSelector } from '../../domain/instrument';
import { timestamp } from '../../shared';
import { State, StateChangeTracker } from '../store-state';
import { StoreEvent } from './store.event';

/**
 * Patches a store with specific event @see TradePatchEvent
 * If there is no specific @see Trade in store, it will create a new one.
 */
export class TradePatchEvent implements StoreEvent {
  constructor(
    readonly instrument: InstrumentSelector,
    readonly rate: number,
    readonly quantity: number,
    readonly timestamp: timestamp
  ) {}

  handle(state: State, changes: StateChangeTracker): void {
    if (!state.subscription.instrument.get(this.instrument.id)) {
      throw new Error(`Trying to patch unsubscribed instrument: ${this.instrument.id}`);
    }

    const trade = state.trade.tryGetOrSet(
      this.instrument.id,
      () => new Trade(state.universe.instrument.get(this.instrument.id))
    );

    state.timestamp = this.timestamp;

    trade.timestamp = this.timestamp;
    trade.rate = trade.instrument.quote.fixed(this.rate);
    trade.quantity = trade.instrument.base.fixed(this.quantity);

    changes.commit(trade);
  }
}
