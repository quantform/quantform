import { Trade } from '../../domain';
import { InstrumentSelector } from '../../domain/instrument';
import { timestamp } from '../../shared';
import { event } from '../../shared/topic';
import { State, StateChangeTracker } from '../store-state';
import { StoreEvent } from './store.event';

/**
 * Patches market trade execution.
 */
@event
export class TradePatchEvent implements StoreEvent {
  type = 'trade-patch';

  constructor(
    readonly instrument: InstrumentSelector,
    readonly rate: number,
    readonly quantity: number,
    readonly timestamp: timestamp
  ) {}
}

/**
 * Patches a store with specific event @see TradePatchEvent
 * If there is no specific @see Trade in store, it will create a new one.
 */
export function TradePatchEventHandler(
  event: TradePatchEvent,
  state: State,
  changes: StateChangeTracker
) {
  if (!state.subscription.instrument.get(event.instrument.id)) {
    throw new Error(`Trying to patch unsubscribed instrument: ${event.instrument.id}`);
  }

  const trade = state.trade.tryGetOrSet(
    event.instrument.id,
    () => new Trade(state.universe.instrument.get(event.instrument.id))
  );

  state.timestamp = event.timestamp;

  trade.timestamp = event.timestamp;
  trade.rate = trade.instrument.quote.fixed(event.rate);
  trade.quantity = trade.instrument.base.fixed(event.quantity);

  changes.commit(trade);
}
