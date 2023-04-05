import { firstValueFrom, of } from 'rxjs';

import * as useCommission from '@lib/commission/use-commission';
import { Commission, d, makeTestModule } from '@quantform/core';

import { useInstruments } from './use-instruments';
import * as useInstrumentsRequest from './use-instruments-request';

describe(useInstruments.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('pipe a collection of instruments when subscription started', async () => {
    fixtures.givenInstrumentsReceived(1, {
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
    });
    fixtures.givenCommissionReceived(new Commission(d(0.01), d(0.02)));

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

    fixtures.givenInstrumentsReceived(1, {
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
    });
    fixtures.givenCommissionReceived(new Commission(d(0.01), d(0.02)));

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
    fixtures.givenInstrumentsReceived(1, {
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
    });

    const [one] = await firstValueFrom(fixtures.whenInstrumentsResolved());
    const [two] = await firstValueFrom(fixtures.whenInstrumentsResolved());

    expect(Object.is(one, two)).toBeTruthy();
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  return {
    givenInstrumentsReceived(timestamp: number, payload: any) {
      jest
        .spyOn(useInstrumentsRequest, 'useInstrumentsRequest')
        .mockReturnValue(of({ timestamp, payload }));
    },
    givenCommissionReceived(commission: Commission) {
      jest.spyOn(useCommission, 'useCommission').mockReturnValue(of(commission));
    },
    whenInstrumentsResolved() {
      return act(() => useInstruments());
    }
  };
}
