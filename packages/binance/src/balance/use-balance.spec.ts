import { firstValueFrom, of } from 'rxjs';

import * as useAsset from '@lib/asset/use-asset';
import * as useBalances from '@lib/balance/use-balances';
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

import { useBalance } from './use-balance';

describe(useBalance.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('pipe a balance when subscription started', () => {
    fixtures.givenAssetReceived(assetOf('binance:btc'));
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

  test('pipe error when subscription started for not existing balance', async () => {
    fixtures.givenAssetReceived(assetOf('binance:btc'));
    fixtures.givenBalancesReceived([
      { asset: assetOf('binance:btc'), available: d(1), unavailable: d.Zero }
    ]);

    const changes = toArray(fixtures.whenBalanceResolved(assetOf('binance:xmr')));

    expect(changes).toEqual([notFound]);
  });

  test('pipe error when subscription started for not existing asset', async () => {
    fixtures.givenAssetReceived(notFound);
    fixtures.givenBalancesReceived([
      { asset: assetOf('binance:btc'), available: d(1), unavailable: d.Zero }
    ]);

    const changes = toArray(fixtures.whenBalanceResolved(assetOf('binance:btc')));

    expect(changes).toEqual([notFound]);
  });

  test('pipe the same instances of balances', async () => {
    fixtures.givenAssetReceived(assetOf('binance:btc'));
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
        .spyOn(useAsset, 'useAsset')
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
      jest.spyOn(useBalances, 'useBalances').mockReturnValue(
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
      return act(() => useBalance(asset));
    }
  };
}
