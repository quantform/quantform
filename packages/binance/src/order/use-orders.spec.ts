import { firstValueFrom, of } from 'rxjs';
import { v4 } from 'uuid';

import { useInstrument } from '@lib/instrument';
import {
  Asset,
  Commission,
  d,
  Instrument,
  makeTestModule,
  mockedFunc
} from '@quantform/core';

import { useOrders } from './use-orders';
import { useOrdersRequest } from './use-orders-request';

jest.mock('@lib/instrument', () => ({
  ...jest.requireActual('@lib/instrument'),
  useBinanceInstrument: jest.fn()
}));

jest.mock('./use-orders-query', () => ({
  ...jest.requireActual('./use-orders-query'),
  useBinanceOpenOrdersQuery: jest.fn()
}));

describe(useOrders.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('initialize connector when requested', async () => {
    fixtures.givenInstrumentsReturned(fixtures.instrument);
    fixtures.givenOpenOrdersQueryReturned([
      {
        id: v4(),
        timestamp: 1,
        instrument: fixtures.instrument,
        binanceId: 17691936021,
        quantity: d(0.00383),
        quantityExecuted: d(0),
        rate: d(19600.0),
        averageExecutionRate: undefined,
        createdAt: 1674468796767
      }
    ]);

    const openOrders = await fixtures.whenUseBinanceOpenOrdersCalled(fixtures.instrument);

    expect(openOrders).toEqual([
      {
        id: expect.any(String),
        timestamp: expect.any(Number),
        instrument: expect.objectContaining({
          id: 'binance:btc-usdt'
        }),
        binanceId: 17691936021,
        quantity: d(0.00383),
        quantityExecuted: d(0),
        rate: d(19600.0),
        averageExecutionRate: undefined,
        createdAt: 1674468796767
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
    givenInstrumentsReturned(instrument: Instrument) {
      mockedFunc(useInstrument).mockReturnValue(of(instrument));
    },
    givenOpenOrdersQueryReturned(payload: any) {
      mockedFunc(useOrdersRequest).mockReturnValue(of(payload));
    },
    whenUseBinanceOpenOrdersCalled: (instrument: Instrument) =>
      act(() => firstValueFrom(useOrders(instrument)))
  };
}
