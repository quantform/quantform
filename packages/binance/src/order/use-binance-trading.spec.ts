import { firstValueFrom, map, take } from 'rxjs';

import {
  Asset,
  Commission,
  d,
  decimal,
  Instrument,
  makeTestModule
} from '@quantform/core';

import { useBinanceOpenOrders } from './use-binance-open-orders';
import { useBinanceTrading } from './use-binance-trading';

describe(useBinanceTrading.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('opens new order', async () => {
    fixtures.whenOpenOrder(fixtures.instrument, d(1), d(10000));

    const openOrders = Object.values(
      await fixtures.thenOpenOrdersChanged(fixtures.instrument)
    );

    expect(openOrders).toEqual([
      {
        id: expect.any(String),
        timestamp: expect.any(Number),
        instrument: expect.objectContaining({
          id: 'binance:btc-usdt'
        }),
        binanceId: undefined,
        quantity: d(1),
        quantityExecuted: d(0),
        rate: d(10000),
        averageExecutionRate: undefined,
        createdAt: expect.any(Number)
      }
    ]);
  });
});

async function getFixtures() {
  const { act, get } = await makeTestModule([]);

  return {
    instrument: new Instrument(
      0,
      new Asset('btc', 'binance', 8),
      new Asset('usdt', 'binance', 4),
      'BTCUSDT',
      Commission.Zero
    ),
    whenOpenOrder: (instrument: Instrument, quantity: decimal, rate?: decimal) =>
      act(() =>
        firstValueFrom(
          useBinanceTrading(instrument).pipe(map(it => it.open({ quantity, rate })))
        )
      ),
    thenOpenOrdersChanged: (instrument: Instrument) =>
      act(() => firstValueFrom(useBinanceOpenOrders.state(instrument)[0]))
  };
}
