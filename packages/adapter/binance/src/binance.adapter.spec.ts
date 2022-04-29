import { AdapterContext, Cache, InMemoryStorage, Store } from '@quantform/core';

import { BinanceAdapter } from './binance.adapter';
import { BinanceConnector } from './binance.connector';

describe('BinanceAdapter', () => {
  let connector: BinanceConnector;
  let adapter: BinanceAdapter;

  beforeAll(() => {
    jest
      .spyOn(BinanceConnector.prototype, 'fetchInstruments')
      .mockImplementation(() => Promise.resolve([]));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    connector = new BinanceConnector();
    adapter = new BinanceAdapter(connector);
  });

  test('should awake adapter', async () => {
    const store = new Store();
    const cache = new Cache(new InMemoryStorage());

    await adapter.awake(new AdapterContext(adapter, store, cache));
  });
});
