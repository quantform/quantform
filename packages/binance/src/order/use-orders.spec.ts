import { firstValueFrom, of, Subject, tap } from 'rxjs';
import { v4 } from 'uuid';
import waitForExpect from 'wait-for-expect';

import { useInstrument } from '@lib/instrument';
import {
  Asset,
  Commission,
  d,
  exclude,
  expectSequence,
  Instrument,
  instrumentNotSupported,
  makeTestModule,
  mockedFunc
} from '@quantform/core';

import { useOrderSocket } from './use-order-socket';
import { useOrders } from './use-orders';
import { useOrdersRequest } from './use-orders-request';

jest.mock('@lib/instrument', () => ({
  ...jest.requireActual('@lib/instrument'),
  useInstrument: jest.fn()
}));
jest.mock('./use-orders-request', () => ({
  ...jest.requireActual('./use-orders-request'),
  useOrdersRequest: jest.fn()
}));
jest.mock('./use-order-socket', () => ({
  ...jest.requireActual('./use-order-socket'),
  useOrderSocket: jest.fn()
}));

describe(useOrders.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('initialize connector when requested', async () => {
    fixtures.givenInstrumentsReturned(fixtures.instrument);

    const updates: any[] = [];

    fixtures
      .act(() =>
        useOrders(fixtures.instrument).pipe(
          exclude(instrumentNotSupported),
          tap(it => updates.push(...Object.values(it).map(it => ({ ...it }))))
        )
      )
      .subscribe();

    fixtures.whenOrderChanged({ id: '1', timestamp: 1, cancelable: true });
    fixtures.whenOpenOrdersReceived([{ id: '2', timestamp: 2, cancelable: true }]);
    fixtures.whenOrderChanged({ id: '2', timestamp: 3, cancelable: true });
    fixtures.whenOrderChanged({ id: '2', timestamp: 4, cancelable: true });

    console.log(updates);

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
  const { act, get } = await makeTestModule([]);

  const orders = new Subject<any>();
  const socket = new Subject<any>();

  mockedFunc(useOrdersRequest).mockReturnValue(orders.asObservable());
  mockedFunc(useOrderSocket).mockReturnValue(socket.asObservable());

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
      mockedFunc(useInstrument).mockReturnValue(of(instrument));
    },
    whenOpenOrdersReceived(payload: any) {
      orders.next(payload);
    },
    whenOrderChanged(payload: any) {
      socket.next(payload);
    },
    whenUseBinanceOpenOrdersCalled: (instrument: Instrument) =>
      act(() => firstValueFrom(useOrders(instrument)))
  };
}
