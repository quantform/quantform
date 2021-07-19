import { timestamp } from '../../common';
import { Asset, Commision, Component } from '../../domain';
import { Instrument, InstrumentSelector } from '../../domain/instrument';
import { State } from '../../store';
import { ExchangeStoreEvent } from './store.event';

export class InstrumentPatchEvent implements ExchangeStoreEvent {
  type = 'instrument-patch';

  constructor(
    readonly timestamp: timestamp,
    readonly base: Asset,
    readonly quote: Asset,
    readonly commision: Commision,
    readonly raw: string,
    readonly leverage?: number
  ) {}

  applicable(): boolean {
    return true;
  }

  execute(state: State): Component | Component[] {
    const selector = new InstrumentSelector(
      this.base.name,
      this.quote.name,
      this.base.exchange
    );

    let instrument = state.universe.instrument[selector.toString()];
    if (!instrument) {
      instrument = new Instrument(this.base, this.quote, this.raw);

      //TODO: add asset before
      state.universe.asset[this.base.toString()] = this.base;
      state.universe.asset[this.quote.toString()] = this.quote;
      state.universe.instrument[selector.toString()] = instrument;
    }

    instrument.timestamp = this.timestamp;
    instrument.commision = this.commision;

    if (this.leverage) {
      instrument.leverage = this.leverage;
    }

    return instrument;
  }
}
