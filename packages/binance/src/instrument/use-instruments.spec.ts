import { readFileSync } from 'fs';
import { join } from 'path';
import { of } from 'rxjs';

import * as useCommission from '@lib/commission/use-commission';
import { Commission, d, makeTestModule, toArray } from '@quantform/core';

import { useInstruments } from './use-instruments';
import * as useInstrumentsRequest from './use-instruments-request';

describe(useInstruments.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('pipe a collection of instruments when subscription started', async () => {
    fixtures.givenInstrumentsReceived(1, fixtures.payload);
    fixtures.givenCommissionReceived(new Commission(d(0.01), d(0.02)));

    const changes = fixtures.whenInstrumentsResolved();

    expect(changes).toEqual([
      expect.arrayContaining([
        expect.objectContaining({
          timestamp: 1,
          base: {
            id: 'binance:btc',
            name: 'btc',
            adapterName: 'binance',
            scale: 5,
            tickSize: d('0.00001')
          },
          quote: {
            id: 'binance:usdt',
            name: 'usdt',
            adapterName: 'binance',
            scale: 2,
            tickSize: d('0.01')
          },
          commission: {
            makerRate: d(0.01),
            takerRate: d(0.02)
          },
          raw: 'BTCUSDT'
        })
      ])
    ]);
  });

  test('pipe a collection of instruments when received new instruments for existing subscription', async () => {
    const changes = fixtures.whenInstrumentsResolved();

    fixtures.givenInstrumentsReceived(1, fixtures.payload);
    fixtures.givenCommissionReceived(new Commission(d(0.01), d(0.02)));

    expect(changes).toEqual([
      expect.arrayContaining([
        expect.objectContaining({
          timestamp: 1,
          base: {
            id: 'binance:btc',
            name: 'btc',
            adapterName: 'binance',
            scale: 5,
            tickSize: d('0.00001')
          },
          quote: {
            id: 'binance:usdt',
            name: 'usdt',
            adapterName: 'binance',
            scale: 2,
            tickSize: d('0.01')
          },
          commission: {
            makerRate: d(0.01),
            takerRate: d(0.02)
          },
          raw: 'BTCUSDT'
        })
      ])
    ]);
  });

  test('pipe the same instances of instruments', async () => {
    fixtures.givenInstrumentsReceived(1, fixtures.payload);

    const [[one]] = fixtures.whenInstrumentsResolved();
    const [[two]] = fixtures.whenInstrumentsResolved();

    expect(Object.is(one, two)).toBeTruthy();
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  return {
    payload: JSON.parse(
      readFileSync(join(__dirname, 'use-instruments-request.payload.json'), 'utf8')
    ),
    givenInstrumentsReceived(timestamp: number, payload: any) {
      jest
        .spyOn(useInstrumentsRequest, 'useInstrumentsRequest')
        .mockReturnValue(of({ timestamp, payload }));
    },
    givenCommissionReceived(commission: Commission) {
      jest.spyOn(useCommission, 'useCommission').mockReturnValue(of(commission));
    },
    whenInstrumentsResolved() {
      return toArray(act(() => useInstruments()));
    }
  };
}
