import {
  Cache,
  d,
  DefaultTimeProvider,
  InMemoryStorage,
  instrumentOf,
  ofType,
  StorageEvent,
  Store,
  Trade
} from '@quantform/core';
import { readFileSync } from 'fs';
import { join } from 'path';

import { DyDxAdapter, DyDxOptions } from './dydx.adapter';
import { DyDxConnector } from './dydx.connector';

function readMockData(fileName: string) {
  return Promise.resolve(
    JSON.parse(readFileSync(join(__dirname, '_MOCK_', fileName), 'utf8'))
  );
}

describe('DyDxAdapter', () => {
  let store: Store;
  let cache: Cache;
  let connector: DyDxConnector;
  let adapter: DyDxAdapter;

  let tradesDispatcher: (message: any) => void;
  let orderbookDispatcher: (message: any) => void;

  beforeAll(() => {
    jest
      .spyOn(DyDxConnector.prototype, 'onboard')
      .mockImplementation(() => Promise.resolve());
    jest
      .spyOn(DyDxConnector.prototype, 'getAccount')
      .mockImplementation(() => readMockData('dxdy-get-account-response.json'));
    jest
      .spyOn(DyDxConnector.prototype, 'getMarkets')
      .mockImplementation(() => readMockData('dydx-get-markets-response.json'));
    jest
      .spyOn(DyDxConnector.prototype, 'trades')
      .mockImplementation((_, tradesHandler) => (tradesDispatcher = tradesHandler));
    jest
      .spyOn(DyDxConnector.prototype, 'orderbook')
      .mockImplementation(
        (_, orderbookHandler) => (orderbookDispatcher = orderbookHandler)
      );

    process.env.QF_DXDY_ETH_PRIVATE_KEY =
      '8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f';
    process.env.QF_DXDY_ETH_ADDRESS = '63FaC9201494f0bd17B9892B9fae4d52fe3BD377';
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    store = new Store();
    cache = new Cache(new InMemoryStorage());
    connector = new DyDxConnector(DyDxOptions.Ropsten);
    adapter = new DyDxAdapter(connector, store, cache, DefaultTimeProvider);
  });

  afterEach(async () => {
    await adapter.dispose();
  });

  test('should awake adapter', async () => {
    await adapter.awake();

    expect(store.snapshot.universe.instrument.asReadonlyArray().length).toEqual(38);
    expect(store.snapshot.universe.asset.asReadonlyArray().length).toEqual(39);
  });

  test('should account adapter', async () => {
    await adapter.awake();
    await adapter.account();
  });

  test('should subscribe for trades', async () => {
    await adapter.awake();

    const instrument = store.snapshot.universe.instrument.get('dydx:btc-usd');

    await adapter.subscribe([instrument]);

    const sut = await new Promise<Trade>(async resolve => {
      store.changes$.pipe(ofType(Trade)).subscribe(it => resolve(it));

      tradesDispatcher(await readMockData('dydx-v3-trades-4-response.json'));
    });

    expect(sut.quantity).toEqual(d(1.4614));
  });

  test('should subscribe for orderbook', async () => {
    await adapter.awake();

    const instrument = store.snapshot.universe.instrument.get('dydx:btc-usd');

    await adapter.subscribe([instrument]);

    orderbookDispatcher(await readMockData('dydx-v3-orderbook-1-response.json'));
    orderbookDispatcher(await readMockData('dydx-v3-orderbook-2-response.json'));
    orderbookDispatcher(await readMockData('dydx-v3-orderbook-3-response.json'));
    orderbookDispatcher(await readMockData('dydx-v3-orderbook-4-response.json'));
    orderbookDispatcher(await readMockData('dydx-v3-orderbook-5-response.json'));

    const orderbook = store.snapshot.orderbook.get('dydx:btc-usd');

    expect(orderbook.asks.rate).toEqual(d(24165));
    expect(orderbook.asks.quantity).toEqual(d(0.941));
    expect(orderbook.bids.rate).toEqual(d(24164));
    expect(orderbook.bids.quantity).toEqual(d(0.5));
  });

  test('should pipe feed historical trade data', async () => {
    const instrument = instrumentOf('dydx:link-usd');
    const from = 1660117024735;
    const to = 1660127024735;

    jest
      .spyOn(connector, 'getTrades')
      .mockImplementation((_, to) => readMockData(`dydx-get-trades-${to}-response.json`));

    await adapter.awake();

    let storage: StorageEvent[] = [];

    await adapter.feed(instrument, from, to, (_, events) => {
      storage = [...events, ...storage];
    });

    expect(storage[0].timestamp).toBeGreaterThanOrEqual(from);
    expect(storage[storage.length - 1].timestamp).toBeLessThanOrEqual(to);
  });
});
