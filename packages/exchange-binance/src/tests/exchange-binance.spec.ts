import {
  Candle,
  ExchangeAwakeRequest,
  ExchangeDisposeRequest,
  ExchangeHistoryRequest,
  InMemoryFeed,
  instrumentOf,
  Store,
  Timeframe
} from '@quantform/core';
import { ExchangeBinanceAdapter } from '../exchange-binance-adapter';

const store = new Store();
const feed = new InMemoryFeed();
const adapter = new ExchangeBinanceAdapter();

describe('binance integration tests', () => {
  beforeAll(async () => {
    await adapter.execute(new ExchangeAwakeRequest(), store, adapter);
  });

  afterAll(async () => {
    await adapter.execute(new ExchangeDisposeRequest(), store, adapter);
  });

  beforeEach(() => {
    feed.clear();
  });

  test('has instruments collection', async () => {
    expect(Object.keys(store.snapshot.universe.instrument).length).toBeGreaterThan(0);
  });
  /*
  test('import specific period', async () => {
    const instrument = instrumentOf('binance:btc-usdt');
    const from = new Date(2021, 1, 15, 10, 0, 0, 0).getTime();
    const to = new Date(2021, 1, 15, 11, 0, 0, 0).getTime();

    const writeSpy = jest.spyOn(feed, 'write');

    await adapter.execute(
      new ExchangeImportRequest(instrument, from, to, feed),
      store,
      adapter
    );

    expect(writeSpy).toBeCalled();

    const measurement = await feed.read(instrument, from, to);

    expect(measurement.length).toEqual(60);
    expect(measurement[0].timestamp).toEqual(from);
    expect(measurement[measurement.length - 1].timestamp).toBeLessThanOrEqual(to);
  });
*/
  test('fetch current history', async () => {
    const instrument = instrumentOf('binance:btc-usdt');

    const writeSpy = jest.spyOn(feed, 'write');

    const history = await adapter.execute<any, Candle[]>(
      new ExchangeHistoryRequest(instrument, Timeframe.M1, 30),
      store,
      adapter
    );

    expect(writeSpy).toBeCalled();

    //history.forEach(it => console.log(it.close));

    //console.log(new Date(history[0].timestamp.getTime()));
    //console.log(new Date(history[history.length - 1].timestamp.getTime()));

    expect(history.length).toEqual(30);
  });
});
