import { Asset, Instrument } from '../../domain';
import { CandleEvent } from '.';
import { now } from '../../shared';
import { Store } from '../store';

const instrument = new Instrument(
  new Asset('btc', 'binance', 8),
  new Asset('usdt', 'binance', 2),
  'binance:btc-usdt'
);

describe('candle patch event tests', () => {
  test('should patch trade object', () => {
    const timestamp = now();
    const store = new Store();

    store.snapshot.universe.instrument[instrument.toString()] = instrument;
    store.snapshot.subscription.instrument[instrument.toString()] = instrument;

    store.dispatch(new CandleEvent(instrument, 1, 1, 1, 1, 1, 1, timestamp));

    const trade = store.snapshot.trade[instrument.toString()];

    expect(trade.timestamp).toEqual(timestamp);
    expect(trade.instrument.toString()).toEqual(instrument.toString());
    expect(trade.rate).toEqual(1);
    expect(trade.quantity).toEqual(1);
    expect(store.snapshot.timestamp).toEqual(timestamp);
  });
});
