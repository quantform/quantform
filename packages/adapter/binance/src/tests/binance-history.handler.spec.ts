import {
  AdapterContext,
  Asset,
  Cache,
  InMemoryStorage,
  Instrument,
  Store,
  Timeframe
} from '@quantform/core';

import { BinanceAdapter } from '../binance.adapter';
import { BinanceHistoryHandler } from '../handlers/binance-history.handler';

describe('binance adapter tests', () => {
  test('should return historical candles', async () => {
    const binance = new BinanceAdapter();
    const store = new Store();
    const cache = new Cache(new InMemoryStorage());
    const instrument = new Instrument(
      new Asset('btc', 'binance', 8),
      new Asset('usdt', 'binance', 2),
      'BTC_USDT'
    );

    store.snapshot.universe.instrument[instrument.toString()] = instrument;

    const response = await BinanceHistoryHandler(
      { instrument, timeframe: Timeframe.M1, length: 10 },
      new AdapterContext(binance, store, cache),
      binance
    );

    expect(response.length).toBe(10);
  });
});
