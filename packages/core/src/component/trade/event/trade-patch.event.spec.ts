import { Asset, Commission, Instrument, TradePatchEvent } from '@lib/component';
import { d, now } from '@lib/shared';
import { Store } from '@lib/store';

const instrument = new Instrument(
  0,
  new Asset('btc', 'binance', 8),
  new Asset('usdt', 'binance', 2),
  'binance:btc-usdt',
  Commission.Zero
);

describe(TradePatchEvent.name, () => {
  test('should create a new trade object and patch a store', () => {
    const timestamp = now();
    const store = new Store();

    store.snapshot.universe.instrument.upsert(instrument);
    store.snapshot.subscription.instrument.upsert(instrument);

    store.dispatch(new TradePatchEvent(instrument, d(1000), d(0.1), timestamp));

    const trade = store.snapshot.trade.get(instrument.id) ?? fail();

    expect(trade.timestamp).toEqual(timestamp);
    expect(trade.instrument.id).toEqual(trade.instrument.id);
    expect(trade.rate).toEqual(d(1000));
    expect(trade.quantity).toEqual(d(0.1));
    expect(store.snapshot.timestamp).toEqual(timestamp);
  });

  test('should use the existing instance of trade when patching a store', () => {
    const store = new Store();
    const timestamp = now();

    store.snapshot.universe.instrument.upsert(instrument);
    store.snapshot.subscription.instrument.upsert(instrument);

    store.dispatch(new TradePatchEvent(instrument, d(1000), d(0.1), timestamp));

    const trade = store.snapshot.trade.get(instrument.id) ?? fail();

    store.dispatch(new TradePatchEvent(instrument, d(2000), d(0.2), timestamp));

    expect(trade.timestamp).toEqual(timestamp);
    expect(trade.instrument.id).toEqual(instrument.id);
    expect(trade.rate).toEqual(d(2000));
    expect(trade.quantity).toEqual(d(0.2));
    expect(store.snapshot.timestamp).toEqual(timestamp);
  });

  test('should throw exception when patching unsubscribed instrument', () => {
    const store = new Store();

    const fn = () => {
      store.dispatch(new TradePatchEvent(instrument, d(1000), d(0.1), now()));
    };

    expect(fn).toThrow(Error);
  });
});
