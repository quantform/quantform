import {
  Cache,
  DefaultTimeProvider,
  InMemoryStorage,
  instrumentOf,
  StorageEvent,
  Store,
  Trade
} from '@quantform/core';
import { readFileSync } from 'fs';
import { join } from 'path';
import { filter, map, Observable } from 'rxjs';

import { DyDxAdapter } from './dydx.adapter';
import { DyDxConnector } from './dydx.connector';

function readMockData(fileName: string) {
  return Promise.resolve(
    JSON.parse(readFileSync(join(__dirname, '_MOCK_', fileName), 'utf8'))
  );
}
// tslint:disable-next-line: no-any
type Constructor<T> = new (...args: any[]) => T;

function typeOf<T extends K, K>(type: Constructor<T>) {
  return (input: Observable<K>) =>
    input.pipe(
      filter(it => it instanceof type),
      map(it => it as T)
    );
}

describe('DyDxAdapter', () => {
  let store: Store;
  let cache: Cache;
  let connector: DyDxConnector;
  let adapter: DyDxAdapter;

  beforeAll(() => {
    jest
      .spyOn(DyDxConnector.prototype, 'getMarkets')
      .mockImplementation(() => readMockData('dydx-get-markets-response.json'));
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    store = new Store();
    cache = new Cache(new InMemoryStorage());
    connector = new DyDxConnector();
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

  test('should subscribe for trades', async done => {
    await adapter.awake();

    const instrument = store.snapshot.universe.instrument.get('dydx:btc-usd');

    store.changes$
      .pipe(typeOf(Trade))
      .subscribe(it => console.log(it.rate.toFixed(it.instrument.quote.scale)));

    await adapter.subscribe([instrument]);
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
