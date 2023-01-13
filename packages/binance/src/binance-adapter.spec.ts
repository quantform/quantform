export function Test() {
  return 0;
}

/*import { readFileSync } from 'fs';
import { join } from 'path';

import {
  Asset,
  assetOf,
  Cache,
  Commission,
  d,
  DefaultTimeProvider,
  InMemoryStorage,
  Instrument,
  instrumentOf,
  Order,
  Store
} from '@quantform/core';

import { BinanceAdapter } from '@lib/binance-adapter';
import { BinanceConnector } from '@lib/binance-connector';

function readMockObject(fileName: string) {
  return Promise.resolve(
    JSON.parse(readFileSync(join(__dirname, '_MOCK_', fileName), 'utf8'))
  );
}

describe(BinanceAdapter.name, () => {
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
      .mockImplementation(() => readMockObject('binance-exchange-info-response.json'));
    jest
      .spyOn(BinanceConnector.prototype, 'account')
      .mockImplementation(() => readMockObject('binance-account-response.json'));
    jest
      .spyOn(BinanceConnector.prototype, 'openOrders')
      .mockImplementation(() => readMockObject('binance-open-orders-response.json'));
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
  /*
  beforeEach(() => {
    store = new Store();
    cache = new Cache(new InMemoryStorage());
    connector = new BinanceConnector();
    adapter = new BinanceAdapter(connector, store, cache, DefaultTimeProvider);
  });
*/
/* test('should awake adapter', async () => {
    await adapter.awake();

    expect(store.snapshot.universe.instrument.asReadonlyArray().length).toEqual(2027);
    expect(store.snapshot.universe.asset.asReadonlyArray().length).toEqual(508);
  });

  test('should synchronize account', async () => {
    await adapter.awake();
    await adapter.account();

    const balance = store.snapshot.balance.get(assetOf('binance:ape').id) ?? fail();
    const orders =
      store.snapshot.order.get(instrumentOf('binance:ape-usdt').id) ?? fail();
    const order = orders.asReadonlyArray()[0];

    expect(balance.free).toEqual(d(10.62704));
    expect(balance.locked).toEqual(d.Zero);

    expect(order.externalId).toEqual('397261951');
    expect(order.rate).toEqual(d(30));
    expect(order.quantity).toEqual(d(-10.62));
    expect(order.quantityExecuted).toEqual(d.Zero);
    expect(order.state).toEqual('PENDING');
  });

  test('should handle unknown order opening', async () => {
    jest.spyOn(connector, 'openOrders').mockImplementation(() => Promise.resolve([]));

    await adapter.awake();
    await adapter.account();

    executionReportDispatcher(
      await readMockObject('binance-1-1-execution-report-response.json')
    );
    outboundAccountPositionDispatcher(
      await readMockObject('binance-1-2-outbound-account-position-response.json')
    );

    const balance = store.snapshot.balance.get(assetOf('binance:ape').id) ?? fail();
    const orders =
      store.snapshot.order.get(instrumentOf('binance:ape-usdt').id) ?? fail();
    const order = orders.asReadonlyArray()[0];

    expect(balance.free).toEqual(d(0.00704));
    expect(balance.locked).toEqual(d(10.62));

    expect(order.externalId).toEqual('398374504');
    expect(order.rate).toEqual(d(30));
    expect(order.quantity).toEqual(d(-10.62));
    expect(order.quantityExecuted).toEqual(d.Zero);
    expect(order.state).toEqual('PENDING');
  });

  test('should handle unknown order opening and canceling', async () => {
    jest.spyOn(connector, 'openOrders').mockImplementation(() => Promise.resolve([]));

    await adapter.awake();
    await adapter.account();

    // order created in mobile app
    executionReportDispatcher(
      await readMockObject('binance-1-1-execution-report-response.json')
    );
    outboundAccountPositionDispatcher(
      await readMockObject('binance-1-2-outbound-account-position-response.json')
    );

    const orders =
      store.snapshot.order.get(instrumentOf('binance:ape-usdt').id) ?? fail();
    const order = orders.asReadonlyArray()[0];

    expect(order.state).toEqual('PENDING');

    // order canceled in mobile app
    executionReportDispatcher(
      await readMockObject('binance-2-1-execution-report-response.json')
    );
    outboundAccountPositionDispatcher(
      await readMockObject('binance-2-2-outbound-account-position-response.json')
    );

    const balance = store.snapshot.balance.get(assetOf('binance:ape').id) ?? fail();

    expect(balance.free).toEqual(d(10.62704));
    expect(balance.locked).toEqual(d.Zero);

    expect(order.id).toEqual('ios_1cd4d19023184bbda0c417d833556d86');
    expect(order.externalId).toEqual('398374504');
    expect(order.rate).toEqual(d(30));
    expect(order.quantity).toEqual(d(-10.62));
    expect(order.quantityExecuted).toEqual(d.Zero);
    expect(order.state).toEqual('CANCELED');

    expect(orders.asReadonlyArray().length).toEqual(1);
  });

  test('should revert balance when order open failed', async () => {
    jest.spyOn(connector, 'openOrders').mockImplementation(() => Promise.resolve([]));
    jest.spyOn(connector, 'open').mockImplementation(() => {
      throw new Error('Failed to open new order');
    });

    const instrument = new Instrument(
      0,
      new Asset('ape', 'binance', 8),
      new Asset('usdt', 'binance', 8),
      '',
      Commission.Zero
    );

    await adapter.awake();
    await adapter.account();

    await adapter.open(new Order(0, 'test', instrument, d(-10), 0));

    const balance = store.snapshot.balance.get(assetOf('binance:ape').id) ?? fail();
    const orders =
      store.snapshot.order.get(instrumentOf('binance:ape-usdt').id) ?? fail();
    const order = orders.asReadonlyArray()[0];

    expect(balance.free).toEqual(d(10.62704));
    expect(balance.locked).toEqual(d.Zero);
    expect(order.state).toEqual('REJECTED');

    expect(orders.asReadonlyArray().length).toEqual(1);
  });

  test('should open new order', async () => {
    jest.spyOn(connector, 'openOrders').mockImplementation(() => Promise.resolve([]));
    jest
      .spyOn(connector, 'open')
      .mockImplementation(() => readMockObject('binance-3-1-open-response.json'));

    const instrument = new Instrument(
      0,
      new Asset('reef', 'binance', 8),
      new Asset('btc', 'binance', 8),
      '',
      Commission.Zero
    );

    await adapter.awake();
    await adapter.account();

    const newOrder = new Order(
      0,
      '9be560a4-4a7b-46ed-a060-d1496d54e483',
      instrument,
      d(5263),
      0,
      d(0.00000019)
    );

    await adapter.open(newOrder);

    executionReportDispatcher(
      await readMockObject('binance-3-2-execution-report-response.json')
    );

    const balance = store.snapshot.balance.get(assetOf('binance:btc').id) ?? fail();
    const orders =
      store.snapshot.order.get(instrumentOf('binance:reef-btc').id) ?? fail();
    const order = orders.asReadonlyArray()[0];

    expect(balance.free).toEqual(d(0.00440995));
    expect(balance.locked).toEqual(d(0.00099997));
    expect(order.state).toEqual('PENDING');

    expect(orders.asReadonlyArray().length).toEqual(1);
  });
});
*/
