import { event } from '../../shared/topic';
import { timestamp } from '../../shared';
import { Asset, Commission } from '../../domain';
import { Instrument, InstrumentSelector } from '../../domain/instrument';
import { State } from '../../store';
import { StoreEvent } from './store.event';

@event
export class InstrumentPatchEvent implements StoreEvent {
  type = 'instrument-patch';

  constructor(
    readonly timestamp: timestamp,
    readonly base: Asset,
    readonly quote: Asset,
    readonly commision: Commission,
    readonly raw: string,
    readonly leverage?: number
  ) {}
}

export function InstrumentPatchEventHandler(event: InstrumentPatchEvent, state: State) {
  const selector = new InstrumentSelector(
    event.base.name,
    event.quote.name,
    event.base.exchange
  );

  let instrument = state.universe.instrument[selector.toString()];
  if (!instrument) {
    instrument = new Instrument(event.base, event.quote, event.raw);

    //TODO: add asset before
    state.universe.asset[event.base.toString()] = event.base;
    state.universe.asset[event.quote.toString()] = event.quote;
    state.universe.instrument[selector.toString()] = instrument;
  }

  instrument.timestamp = event.timestamp;
  instrument.commission = event.commision;

  if (event.leverage) {
    instrument.leverage = event.leverage;
  }

  return instrument;
}

@event
export class InstrumentSubscriptionEvent implements StoreEvent {
  type = 'instrument-subscription';

  constructor(
    readonly timestamp: timestamp,
    readonly instrument: InstrumentSelector,
    readonly subscribed: boolean
  ) {}
}

export function InstrumentSubscriptionEventHandler(
  event: InstrumentSubscriptionEvent,
  state: State
) {
  const instrumentKey = event.instrument.toString();

  if (!(instrumentKey in state.universe.instrument)) {
    throw new Error(`Trying to patch not existing instrument: ${instrumentKey}`);
  }

  const instrument = state.universe.instrument[instrumentKey];

  if (event.subscribed) {
    state.subscription.instrument[instrument.toString()] = instrument;
    state.subscription.asset[instrument.base.toString()] = instrument.base;
    state.subscription.asset[instrument.quote.toString()] = instrument.quote;
  }

  return instrument;
}
