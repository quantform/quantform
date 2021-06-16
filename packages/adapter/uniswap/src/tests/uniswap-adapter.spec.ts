import {
  Candle,
  AdapterAwakeRequest,
  AdapterDisposeRequest,
  AdapterHistoryRequest,
  InMemoryFeed,
  instrumentOf,
  Store,
  Timeframe
} from '@quantform/core';
import { UniswapAdapter } from '../uniswap-adapter';

const store = new Store();
const feed = new InMemoryFeed();
const adapter = new UniswapAdapter();

describe('uniswap integration tests', () => {
  beforeAll(async () => {
    await adapter.execute(new AdapterAwakeRequest(), store, adapter);
  });

  afterAll(async () => {
    await adapter.execute(new AdapterDisposeRequest(), store, adapter);
  });

  beforeEach(() => {
    feed.clear();
  });

  test('has instruments collection', async () => {
    expect(Object.keys(store.snapshot.universe.instrument).length).toBeGreaterThan(0);
  });
});
