import {
  assetOf,
  Cache,
  DefaultTimeProvider,
  InMemoryStorage,
  instrumentOf,
  Store
} from '@quantform/core';
import { readFileSync } from 'fs';
import { join } from 'path';

import { BinanceAdapter } from './binance.adapter';
import { BinanceConnector } from './binance.connector';

function readMockData(fileName: string) {
  return Promise.resolve(
    JSON.parse(readFileSync(join(__dirname, '_MOCK_', fileName), 'utf8'))
  );
}

describe('BinanceAdapter', () => {
  let store: Store;
  let cache: Cache;
  let connector: BinanceConnector;
  let adapter: BinanceAdapter;

  let executionReportDispatcher: (message: any) => void;
  let outboundAccountPositionDispatcher: (message: any) => void;

  beforeAll(() => {
    jest
      .spyOn(BinanceConnector.prototype, 'useServerTime')
      .mockImplementation(() => Promise.resolve());
    jest
      .spyOn(BinanceConnector.prototype, 'getExchangeInfo')
      .mockImplementation(() => readMockData('binance-exchange-info-response.json'));
    jest
      .spyOn(BinanceConnector.prototype, 'account')
      .mockImplementation(() => readMockData('binance-account-response.json'));
    jest
      .spyOn(BinanceConnector.prototype, 'openOrders')
      .mockImplementation(() => readMockData('binance-open-orders-response.json'));
    jest
      .spyOn(BinanceConnector.prototype, 'userData')
      .mockImplementation(
        async (executionReportHandler, outboundAccountPositionHandler) => {
          executionReportDispatcher = executionReportHandler;
          outboundAccountPositionDispatcher = outboundAccountPositionHandler;
        }
      );
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    store = new Store();
    cache = new Cache(new InMemoryStorage());
    connector = new BinanceConnector();
    adapter = new BinanceAdapter(connector, store, cache, DefaultTimeProvider);
  });

  test('should awake adapter', async () => {
    await adapter.awake();

    expect(store.snapshot.universe.instrument.asReadonlyArray().length).toEqual(2027);
    expect(store.snapshot.universe.asset.asReadonlyArray().length).toEqual(508);
  });

  test('should synchronize account', async () => {
    await adapter.awake();
    await adapter.account();

    const balance = store.snapshot.balance.get(assetOf('binance:ape').id);
    const order = store.snapshot.order
      .get(instrumentOf('binance:ape-usdt').id)
      .asReadonlyArray()[0];

    expect(balance.free).toEqual(10.62703999);
    expect(balance.locked).toEqual(0);

    expect(order.externalId).toEqual('397261951');
    expect(order.rate).toEqual(30);
    expect(order.quantity).toEqual(-10.62);
    expect(order.quantityExecuted).toEqual(0);
    expect(order.type).toEqual('LIMIT');
    expect(order.state).toEqual('PENDING');
  });

  test('should handle unknown order opening', async () => {
    jest.spyOn(connector, 'openOrders').mockImplementation(() => Promise.resolve([]));

    await adapter.awake();
    await adapter.account();

    executionReportDispatcher(
      await readMockData('binance-1-1-execution-report-response.json')
    );
    outboundAccountPositionDispatcher(
      await readMockData('binance-1-2-outbound-account-position-response.json')
    );

    const balance = store.snapshot.balance.get(assetOf('binance:ape').id);
    const order = store.snapshot.order
      .get(instrumentOf('binance:ape-usdt').id)
      .asReadonlyArray()[0];

    expect(balance.free).toEqual(0.00704);
    expect(balance.locked).toEqual(10.62);

    expect(order.externalId).toEqual('398374504');
    expect(order.rate).toEqual(30);
    expect(order.quantity).toEqual(-10.62);
    expect(order.quantityExecuted).toEqual(0);
    expect(order.type).toEqual('LIMIT');
    expect(order.state).toEqual('PENDING');
  });

  test('should handle unknown order opening and canceling', async () => {
    jest.spyOn(connector, 'openOrders').mockImplementation(() => Promise.resolve([]));

    await adapter.awake();
    await adapter.account();

    // order created in mobile app
    executionReportDispatcher(
      await readMockData('binance-1-1-execution-report-response.json')
    );
    outboundAccountPositionDispatcher(
      await readMockData('binance-1-2-outbound-account-position-response.json')
    );

    // order canceled in mobile app
    executionReportDispatcher(
      await readMockData('binance-2-1-execution-report-response.json')
    );
    outboundAccountPositionDispatcher(
      await readMockData('binance-2-2-outbound-account-position-response.json')
    );

    const balance = store.snapshot.balance.get(assetOf('binance:ape').id);
    const order = store.snapshot.order
      .get(instrumentOf('binance:ape-usdt').id)
      .asReadonlyArray()[0];

    expect(balance.free).toEqual(10.62703999);
    expect(balance.locked).toEqual(0);

    expect(order.id).toEqual('ios_1cd4d19023184bbda0c417d833556d86');
    expect(order.externalId).toEqual('398374504');
    expect(order.rate).toEqual(30);
    expect(order.quantity).toEqual(-10.62);
    expect(order.quantityExecuted).toEqual(0);
    expect(order.type).toEqual('LIMIT');
    expect(order.state).toEqual('CANCELED');

    expect(
      store.snapshot.order.get(instrumentOf('binance:ape-usdt').id).asReadonlyArray()
        .length
    ).toEqual(1);
  });
});
