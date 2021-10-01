import { Asset, Instrument } from '../../domain';
import { TradePatchEvent, TradePatchEventHandler } from '.';
import { State } from '../store.state';
import { now } from '../../common';

describe('trade patch event tests', () => {
  test('should create a new trade object and patch a store', () => {
    const timestamp = now();
    const state = new State();
    const instrument = new Instrument(
      new Asset('btc', 'binance', 8),
      new Asset('usdt', 'binance', 2),
      'binance:btc-usdt'
    );

    state.universe.instrument[instrument.toString()] = instrument;

    const event = new TradePatchEvent(instrument, 1000, 0.1, timestamp);

    TradePatchEventHandler(event, state);

    const trade = state.trade[instrument.toString()];

    expect(trade.timestamp).toEqual(timestamp);
    expect(trade.instrument.toString()).toEqual(trade.instrument.toString());
    expect(trade.rate).toEqual(1000);
    expect(trade.quantity).toEqual(0.1);
  });
});
