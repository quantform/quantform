import { AdapterContext, Cache, InMemoryStorage, Store } from '@quantform/core';

import { UniswapAdapter } from '../uniswap-adapter';

const store = new Store();
const storage = new InMemoryStorage();
const cache = new Cache(storage);
const adapter = new UniswapAdapter();

describe('uniswap integration tests', () => {
  beforeAll(async () => {
    await adapter.awake(new AdapterContext(adapter, store, cache));
  });

  afterAll(async () => {
    await adapter.dispose();
  });

  beforeEach(() => {
    storage.clear();
  });

  test('has instruments collection', async () => {
    expect(Object.keys(store.snapshot.universe.instrument).length).toBeGreaterThan(0);
  });
});
