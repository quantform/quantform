import {
  InMemoryFeed,
  Store,
  AdapterAwakeCommand,
  AdapterDisposeCommand,
  AdapterContext
} from '@quantform/core';
import { UniswapAdapter } from '../uniswap-adapter';

const store = new Store();
const feed = new InMemoryFeed();
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
    feed.clear();
  });

  test('has instruments collection', async () => {
    expect(Object.keys(store.snapshot.universe.instrument).length).toBeGreaterThan(0);
  });
});
