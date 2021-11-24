import { Asset, Instrument } from '../../domain';
import { CandleEvent, CandleEventHandler } from '.';
import { State } from '../store.state';
import { now } from '../../common';

const instrument = new Instrument(
  new Asset('btc', 'binance', 8),
  new Asset('usdt', 'binance', 2),
  'binance:btc-usdt'
);

describe('candle patch event tests', () => {
  test('should patch trade object', () => {
    const timestamp = now();
    const state = new State();

    state.universe.instrument[instrument.toString()] = instrument;
    state.subscription.instrument[instrument.toString()] = instrument;

    const event = new CandleEvent(instrument, 1, 1, 1, 1, 1, 1, timestamp);

    CandleEventHandler(event, state);

    const trade = state.trade[instrument.toString()];

    expect(trade.timestamp).toEqual(timestamp);
    expect(trade.instrument.toString()).toEqual(instrument.toString());
    expect(trade.rate).toEqual(1);
    expect(trade.quantity).toEqual(1);
    expect(state.timestamp).toEqual(timestamp);
  });
});
