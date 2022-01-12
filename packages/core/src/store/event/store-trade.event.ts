import { event } from '../../shared/topic';
import { timestamp } from '../../shared';
import { Trade } from '../../domain';
import { InstrumentSelector } from '../../domain/instrument';
import { State, StateChangeTracker } from '../store.state';
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
  const instrumentKey = event.instrument.toString();

  if (!(instrumentKey in state.subscription.instrument)) {
    throw new Error(`Trying to patch unsubscribed instrument: ${instrumentKey}`);
  }

  let trade = state.trade[instrumentKey];
  if (!trade) {
    trade = new Trade(state.universe.instrument[instrumentKey]);

    state.trade[instrumentKey] = trade;
  }

  state.timestamp = event.timestamp;

  trade.timestamp = event.timestamp;
  trade.rate = trade.instrument.quote.fixed(event.rate);
  trade.quantity = trade.instrument.base.fixed(event.quantity);

  changes.commit(trade);
}
