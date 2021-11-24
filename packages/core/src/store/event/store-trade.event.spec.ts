import { Asset, Instrument } from '../../domain';
import { TradePatchEvent, TradePatchEventHandler } from '.';
import { State } from '../store.state';
import { now } from '../../common';

const instrument = new Instrument(
  new Asset('btc', 'binance', 8),
  new Asset('usdt', 'binance', 2),
  'binance:btc-usdt'
);

describe('trade patch event tests', () => {
  test('should create a new trade object and patch a store', () => {
    const timestamp = now();
    const state = new State();

    state.universe.instrument[instrument.toString()] = instrument;
    state.subscription.instrument[instrument.toString()] = instrument;

    const event = new TradePatchEvent(instrument, 1000, 0.1, timestamp);

    TradePatchEventHandler(event, state);

    const trade = state.trade[instrument.toString()];

    expect(trade.timestamp).toEqual(timestamp);
    expect(trade.instrument.toString()).toEqual(trade.instrument.toString());
    expect(trade.rate).toEqual(1000);
    expect(trade.quantity).toEqual(0.1);
    expect(state.timestamp).toEqual(timestamp);
  });

  test('should use the existing instance of trade when patching a store', () => {
    const state = new State();

    state.universe.instrument[instrument.toString()] = instrument;
    state.subscription.instrument[instrument.toString()] = instrument;

    TradePatchEventHandler(new TradePatchEvent(instrument, 1000, 0.1, now()), state);

    const timestamp = now();
    const trade = state.trade[instrument.toString()];

    TradePatchEventHandler(new TradePatchEvent(instrument, 2000, 0.2, timestamp), state);

    expect(trade.timestamp).toEqual(timestamp);
    expect(trade.instrument.toString()).toEqual(instrument.toString());
    expect(trade.rate).toEqual(2000);
    expect(trade.quantity).toEqual(0.2);
    expect(state.timestamp).toEqual(timestamp);
  });

  test('should throw exception when patching unsubscribed instrument', () => {
    const fn = () => {
      const event = new TradePatchEvent(instrument, 1000, 0.1, now());

      TradePatchEventHandler(event, new State());
    };

    expect(fn).toThrow(Error);
  });
});
