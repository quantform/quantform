import { firstValueFrom, of } from 'rxjs';

import * as withExchangeInfoRequest from '@lib/api/with-exchange-info-request';
import { Commission, d, makeTestModule } from '@quantform/core';

import * as getCommission from './get-commission';
import { getInstruments } from './get-instruments';

describe(getInstruments.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('pipe a collection of instruments when subscription started', async () => {
    fixtures.givenCommissionReceived(new Commission(d(0.01), d(0.02)));
    fixtures.givenInstrumentsReceived(1, fixtures.payload);

    const changes = await firstValueFrom(fixtures.whenInstrumentsResolved());

    expect(changes).toEqual([
      expect.objectContaining({
        timestamp: 1,
        id: 'binance:eth-btc',
        base: {
          id: 'binance:eth',
          name: 'eth',
          adapterName: 'binance',
          scale: 4,
          tickSize: d('0.0001')
        },
        quote: {
          id: 'binance:btc',
          name: 'btc',
          adapterName: 'binance',
          scale: 6,
          tickSize: d('0.000001')
        },
        commission: {
          makerRate: d(0.01),
          takerRate: d(0.02)
        },
        leverage: undefined,
        raw: 'ETHBTC'
      })
    ]);
  });

  test('pipe a collection of instruments when received new instruments for existing subscription', async () => {
    const changes = await firstValueFrom(fixtures.whenInstrumentsResolved());

    fixtures.givenCommissionReceived(new Commission(d(0.01), d(0.02)));
    fixtures.givenInstrumentsReceived(1, fixtures.payload);

    expect(changes).toEqual([
      expect.objectContaining({
        timestamp: 1,
        id: 'binance:eth-btc',
        base: {
          id: 'binance:eth',
          name: 'eth',
          adapterName: 'binance',
          scale: 4,
          tickSize: d('0.0001')
        },
        quote: {
          id: 'binance:btc',
          name: 'btc',
          adapterName: 'binance',
          scale: 6,
          tickSize: d('0.000001')
        },
        commission: {
          makerRate: d(0.01),
          takerRate: d(0.02)
        },
        leverage: undefined,
        raw: 'ETHBTC'
      })
    ]);
  });

  test('pipe the same instances of instruments', async () => {
    fixtures.givenCommissionReceived(new Commission(d(0.01), d(0.02)));
    fixtures.givenInstrumentsReceived(1, fixtures.payload);

    const [one] = await firstValueFrom(fixtures.whenInstrumentsResolved());
    const [two] = await firstValueFrom(fixtures.whenInstrumentsResolved());

    expect(one).toEqual(two);
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  return {
    payload: {
      symbols: [
        {
          symbol: 'ETHBTC',
          baseAsset: 'ETH',
          quoteAsset: 'BTC',
          filters: [
            { filterType: 'PRICE_FILTER', tickSize: '0.00000100' },
            { filterType: 'LOT_SIZE', stepSize: '0.00010000' }
          ]
        }
      ]
    },
    givenInstrumentsReceived(timestamp: number, payload: any) {
      jest
        .spyOn(withExchangeInfoRequest, 'withExchangeInfoRequest')
        .mockReturnValue(of({ timestamp, payload }));
    },
    givenCommissionReceived(commission: Commission) {
      jest.spyOn(getCommission, 'getCommission').mockReturnValue(of(commission));
    },
    whenInstrumentsResolved() {
      return act(() => getInstruments());
    }
  };
}
