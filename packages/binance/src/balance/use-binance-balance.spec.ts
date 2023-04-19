import { firstValueFrom, of } from 'rxjs';

import * as useBinanceAsset from '@lib/asset/use-binance-asset';
import * as useBinanceBalances from '@lib/balance/use-binance-balances';
import {
  Asset,
  assetOf,
  AssetSelector,
  d,
  decimal,
  makeTestModule,
  notFound,
  toArray
} from '@quantform/core';

import { useBinanceBalance } from './use-binance-balance';

describe(useBinanceBalance.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('pipe a balance when subscription started', () => {
    fixtures.givenBalancesReceived([
      { asset: assetOf('binance:btc'), available: d(1), unavailable: d.Zero }
    ]);

    const changes = toArray(fixtures.whenBalanceResolved(assetOf('binance:btc')));

    expect(changes).toEqual([
      {
        timestamp: expect.any(Number),
        asset: expect.objectContaining({
          id: 'binance:btc'
        }),
        available: d(1),
        unavailable: d.Zero
      }
    ]);
  });

  test('pipe error when subscription started for not existing asset', async () => {
    fixtures.givenBalancesReceived([
      { asset: assetOf('binance:btc'), available: d(1), unavailable: d.Zero }
    ]);

    const changes = toArray(fixtures.whenBalanceResolved(assetOf('binance:xmr')));

    expect(changes).toEqual([notFound]);
  });

  test('pipe the same instances of balances', async () => {
    fixtures.givenBalancesReceived([
      { asset: assetOf('binance:btc'), available: d(1), unavailable: d.Zero }
    ]);

    const one = await firstValueFrom(
      fixtures.whenBalanceResolved(assetOf('binance:btc'))
    );
    const two = await firstValueFrom(
      fixtures.whenBalanceResolved(assetOf('binance:btc'))
    );

    expect(Object.is(one, two)).toBeTruthy();
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  return {
    givenAssetReceived(asset: AssetSelector | typeof notFound) {
      jest
        .spyOn(useBinanceAsset, 'useBinanceAsset')
        .mockReturnValue(
          of(asset !== notFound ? new Asset(asset.name, asset.adapterName, 8) : notFound)
        );
    },
    givenBalancesReceived(
      balances: {
        asset: AssetSelector;
        available: decimal;
        unavailable: decimal;
      }[]
    ) {
      jest.spyOn(useBinanceBalances, 'useBinanceBalances').mockReturnValue(
        of(
          balances.reduce((snapshot, { asset, available, unavailable }) => {
            snapshot[asset.id] = {
              asset: new Asset(asset.name, asset.adapterName, 8),
              available,
              unavailable,
              timestamp: 0
            };

            return snapshot;
          }, {} as Record<string, any>)
        )
      );
    },
    whenBalanceResolved(asset: AssetSelector) {
      return act(() => useBinanceBalance(asset));
    }
  };
}
