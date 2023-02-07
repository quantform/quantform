import { firstValueFrom, of } from 'rxjs';

import {
  Asset,
  Commission,
  d,
  decimal,
  Instrument,
  makeTestModule,
  mockFunc
} from '@quantform/core';

import { useBinanceOpenOrders } from './use-binance-open-orders';
import { useBinanceOrderNewCommand } from './use-binance-order-new-command';
import { useBinanceOrderSubmit } from './use-binance-order-submit';

jest.mock('./use-binance-order-new-command', () => ({
  ...jest.requireActual('./use-binance-order-new-command'),
  useBinanceOrderNewCommand: jest.fn()
}));

describe(useBinanceOrderSubmit.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('opens new order', async () => {
    const order = await fixtures.whenOpenOrder(fixtures.instrument, d(1), d(10000));

    const openOrders = Object.values(
      await fixtures.thenOpenOrdersChanged(fixtures.instrument)
    );

    expect(order).toEqual({
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
    });

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
  const { act } = await makeTestModule([]);

  mockFunc(useBinanceOrderNewCommand).mockReturnValue(of({}));

  return {
    instrument: new Instrument(
      0,
      new Asset('btc', 'binance', 8),
      new Asset('usdt', 'binance', 4),
      'BTCUSDT',
      Commission.Zero
    ),
    whenOpenOrder: (instrument: Instrument, quantity: decimal, rate?: decimal) =>
      act(() => {
        const { submit } = useBinanceOrderSubmit(instrument);

        return firstValueFrom(submit({ quantity, rate }));
      }),
    thenOpenOrdersChanged: (instrument: Instrument) =>
      act(() => firstValueFrom(useBinanceOpenOrders.state(instrument)[0]))
  };
}
