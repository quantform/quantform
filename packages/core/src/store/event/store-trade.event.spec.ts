import { Asset, Instrument } from '../../domain';
import { now } from '../../shared';
import { Store } from '..';
import { TradePatchEvent } from '.';

const instrument = new Instrument(
  new Asset('btc', 'binance', 8),
  new Asset('usdt', 'binance', 2),
  'binance:btc-usdt'
);

describe('trade patch event tests', () => {
  test('should create a new trade object and patch a store', () => {
    const timestamp = now();
    const store = new Store();

    store.snapshot.universe.instrument.upsert(instrument);
    store.snapshot.subscription.instrument.upsert(instrument);

    store.dispatch(new TradePatchEvent(instrument, 1000, 0.1, timestamp));

    const trade = store.snapshot.trade.get(instrument.id);

    expect(trade.timestamp).toEqual(timestamp);
    expect(trade.instrument.id).toEqual(trade.instrument.id);
    expect(trade.rate).toEqual(1000);
    expect(trade.quantity).toEqual(0.1);
    expect(store.snapshot.timestamp).toEqual(timestamp);
  });

  test('should use the existing instance of trade when patching a store', () => {
    const store = new Store();

    store.snapshot.universe.instrument.upsert(instrument);
    store.snapshot.subscription.instrument.upsert(instrument);

    store.dispatch(new TradePatchEvent(instrument, 1000, 0.1, now()));

    const timestamp = now();
    const trade = store.snapshot.trade.get(instrument.id);

    store.dispatch(new TradePatchEvent(instrument, 2000, 0.2, now()));

    expect(trade.timestamp).toEqual(timestamp);
    expect(trade.instrument.id).toEqual(instrument.id);
    expect(trade.rate).toEqual(2000);
    expect(trade.quantity).toEqual(0.2);
    expect(store.snapshot.timestamp).toEqual(timestamp);
  });

  test('should throw exception when patching unsubscribed instrument', () => {
    const store = new Store();

    const fn = () => {
      store.dispatch(new TradePatchEvent(instrument, 1000, 0.1, now()));
    };

    expect(fn).toThrow(Error);
  });
});
