import {
  Feed,
  InMemoryStorage,
  Store,
  AdapterAwakeCommand,
  AdapterDisposeCommand,
  AdapterContext
} from '@quantform/core';
import { UniswapAdapter } from '../uniswap-adapter';

const store = new Store();
const storage = new InMemoryStorage();
const feed = new Feed(storage);
const adapter = new UniswapAdapter();

describe('uniswap integration tests', () => {
  beforeAll(async () => {
    await adapter.dispatch(new AdapterAwakeCommand(), new AdapterContext(adapter, store));
  });

  afterAll(async () => {
    await adapter.dispatch(
      new AdapterDisposeCommand(),
      new AdapterContext(adapter, store)
    );
  });

  beforeEach(() => {
    storage.clear();
  });

  test('has instruments collection', async () => {
    expect(Object.keys(store.snapshot.universe.instrument).length).toBeGreaterThan(0);
  });
});
