import { event } from '../../common/topic';
import { timestamp } from '../../common';
import { Trade } from '../../domain';
import { InstrumentSelector } from '../../domain/instrument';
import { State } from '../store.state';
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
 * If there is no specific trade in store, it will create a new one.
 */
export function TradePatchEventHandler(event: TradePatchEvent, state: State) {
  // skip pathing if there is no subscription for this instrument
  if (event.instrument.toString()! in state.subscription.instrument) {
    return;
  }

  let trade = state.trade[event.instrument.toString()];
  if (!trade) {
    trade = new Trade(state.universe.instrument[event.instrument.toString()]);

    state.trade[event.instrument.toString()] = trade;
  }

  state.timestamp = event.timestamp;

  trade.timestamp = event.timestamp;
  trade.rate = trade.instrument.quote.fixed(event.rate);
  trade.quantity = trade.instrument.base.fixed(event.quantity);

  return trade;
}
