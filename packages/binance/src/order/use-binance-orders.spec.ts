import { firstValueFrom, of, Subject, tap } from 'rxjs';

import { useBinanceInstrument } from '@lib/instrument';
import {
  Asset,
  Commission,
  exclude,
  Instrument,
  makeTestModule,
  missed,
  mockedFunc
} from '@quantform/core';

import { useBinanceOrderSocket } from './use-binance-order-socket';
import { useBinanceOrders } from './use-binance-orders';
import { useBinanceOrdersRequest } from './use-binance-orders-request';

jest.mock('@lib/instrument', () => ({
  ...jest.requireActual('@lib/instrument'),
  useBinanceInstrument: jest.fn()
}));
jest.mock('./use-binance-orders-request', () => ({
  ...jest.requireActual('./use-binance-orders-request'),
  useBinanceOrdersRequest: jest.fn()
}));
jest.mock('./use-binance-order-socket', () => ({
  ...jest.requireActual('./use-binance-order-socket'),
  useBinanceOrderSocket: jest.fn()
}));

describe(useBinanceOrders.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('initialize connector when requested', async () => {
    fixtures.givenInstrumentsReturned(fixtures.instrument);

    const updates: any[] = [];

    fixtures
      .act(() =>
        useBinanceOrders(fixtures.instrument).pipe(
          exclude(missed),
          tap(it => updates.push(...Object.values(it).map(it => ({ ...it }))))
        )
      )
      .subscribe();

    fixtures.whenOrderChanged({ id: '1', timestamp: 1, cancelable: true });
    fixtures.whenOpenOrdersReceived([{ id: '2', timestamp: 2, cancelable: true }]);
    fixtures.whenOrderChanged({ id: '2', timestamp: 3, cancelable: true });
    fixtures.whenOrderChanged({ id: '2', timestamp: 4, cancelable: true });

    expect(updates).toEqual([
      expect.objectContaining({ id: '1', timestamp: 1 }),
      expect.objectContaining({ id: '2', timestamp: 2 }),
      expect.objectContaining({ id: '1', timestamp: 1 }),
      expect.objectContaining({ id: '2', timestamp: 3 }),
      expect.objectContaining({ id: '1', timestamp: 1 }),
      expect.objectContaining({ id: '2', timestamp: 4 })
    ]);
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  const orders = new Subject<any>();
  const socket = new Subject<any>();

  mockedFunc(useBinanceOrdersRequest).mockReturnValue(orders.asObservable());
  mockedFunc(useBinanceOrderSocket).mockReturnValue(socket.asObservable());

  return {
    act,
    instrument: new Instrument(
      0,
      new Asset('btc', 'binance', 8),
      new Asset('usdt', 'binance', 4),
      'BTCUSDT',
      Commission.Zero
    ),
    givenInstrumentsReturned(instrument: Instrument) {
      mockedFunc(useBinanceInstrument).mockReturnValue(of(instrument));
    },
    whenOpenOrdersReceived(payload: any) {
      orders.next(payload);
    },
    whenOrderChanged(payload: any) {
      socket.next(payload);
    },
    whenUseBinanceOpenOrdersCalled: (instrument: Instrument) =>
      act(() => firstValueFrom(useBinanceOrders(instrument)))
  };
}
