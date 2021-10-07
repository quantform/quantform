import {
  InMemoryFeed,
  Store,
  AdapterAwakeCommand,
  AdapterDisposeCommand
} from '@quantform/core';
import { UniswapAdapter } from '../uniswap-adapter';

const store = new Store();
const feed = new InMemoryFeed();
const adapter = new UniswapAdapter();

describe('uniswap integration tests', () => {
  beforeAll(async () => {
    await adapter.dispatch(new AdapterAwakeCommand(), {
      store,
      timestamp: adapter.timestamp()
    });
  });

  afterAll(async () => {
    await adapter.dispatch(new AdapterDisposeCommand(), {
      store,
      timestamp: adapter.timestamp()
    });
  });

  beforeEach(() => {
    feed.clear();
  });

  test('has instruments collection', async () => {
    expect(Object.keys(store.snapshot.universe.instrument).length).toBeGreaterThan(0);
  });
});
