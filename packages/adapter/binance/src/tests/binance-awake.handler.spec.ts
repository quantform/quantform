import { BinanceAdapter } from '../binance.adapter';
import { Store, AdapterContext } from '@quantform/core';
import { BinanceAwakeHandler } from '../handlers/binance-awake.handler';

describe('binance adapter tests', () => {
  test('awake command should return list of instruments', async () => {
    const binance = new BinanceAdapter();
    const store = new Store();

    await BinanceAwakeHandler(new AdapterContext(binance, store), binance);

    expect(Object.keys(store.snapshot.universe.instrument).length).toBeGreaterThan(1);
  });
});
