import { Asset, Instrument } from '../../domain';
import { now } from '../../shared';
import { Store } from '../store';
import { CandleEvent } from '.';

const instrument = new Instrument(
  new Asset('btc', 'binance', 8),
  new Asset('usdt', 'binance', 2),
  'binance:btc-usdt'
);

describe('candle patch event tests', () => {
  test('should patch trade object', () => {
    const timestamp = now();
    const store = new Store();

    store.snapshot.universe.instrument.upsert(instrument);
    store.snapshot.subscription.instrument.upsert(instrument);

    store.dispatch(new CandleEvent(instrument, 1, 1, 1, 1, 1, 1, timestamp));

    const trade = store.snapshot.trade.get(instrument.id);

    expect(trade.timestamp).toEqual(timestamp);
    expect(trade.instrument.id).toEqual(instrument.id);
    expect(trade.rate).toEqual(1);
    expect(trade.quantity).toEqual(1);
    expect(store.snapshot.timestamp).toEqual(timestamp);
  });
});
