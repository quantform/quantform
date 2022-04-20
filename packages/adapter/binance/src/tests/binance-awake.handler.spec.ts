import { AdapterContext, Cache, InMemoryStorage, Store } from '@quantform/core';

import { BinanceAdapter } from '../binance.adapter';
import { BinanceAwakeHandler } from '../handlers/binance-awake.handler';

describe('binance adapter tests', () => {
  test('awake command should return list of instruments', async () => {
    const binance = new BinanceAdapter();
    const store = new Store();
    const cache = new Cache(new InMemoryStorage());

    await BinanceAwakeHandler(new AdapterContext(binance, store, cache), binance);

    expect(Object.keys(store.snapshot.universe.instrument).length).toBeGreaterThan(1);
  });
});
