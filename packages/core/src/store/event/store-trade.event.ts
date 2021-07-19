import { timestamp } from '../../common';
import { Component, Trade } from '../../domain';
import { InstrumentSelector } from '../../domain/instrument';
import { State } from '../store.state';
import { ExchangeStoreEvent } from './store.event';

export class TradePatchEvent implements ExchangeStoreEvent {
  type = 'trade-patch';

  constructor(
    readonly instrument: InstrumentSelector,
    readonly rate: number,
    readonly quantity: number,
    readonly timestamp: timestamp
  ) {}

  applicable(state: State): boolean {
    return this.instrument.toString() in state.subscription.instrument;
  }

  execute(state: State): Component | Component[] {
    let trade = state.trade[this.instrument.toString()];

    if (!trade) {
      const instrument = state.universe.instrument[this.instrument.toString()];

      trade = new Trade(instrument);

      state.trade[this.instrument.toString()] = trade;
    }

    trade.rate = trade.instrument.quote.fixed(this.rate);
    trade.quantity = trade.instrument.base.fixed(this.quantity);

    return trade;
  }
}
