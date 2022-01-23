import { Feed, InMemoryStorage, Store, AdapterContext } from '@quantform/core';
import { UniswapAdapter } from '../uniswap-adapter';

const store = new Store();
const storage = new InMemoryStorage();
const feed = new Feed(storage);
const adapter = new UniswapAdapter();

describe('uniswap integration tests', () => {
  beforeAll(async () => {
    await adapter.awake(new AdapterContext(adapter, store));
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
