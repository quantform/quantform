import { event } from '../../common/topic';
import { timestamp } from '../../common';
import { Asset, Commision } from '../../domain';
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
    readonly commision: Commision,
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
  instrument.commision = event.commision;

  if (event.leverage) {
    instrument.leverage = event.leverage;
  }

  return instrument;
}
