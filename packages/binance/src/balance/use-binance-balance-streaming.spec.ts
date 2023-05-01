import { defer, firstValueFrom, of } from 'rxjs';

import * as useBinanceAsset from '@lib/asset/use-binance-asset';
import * as useBinanceBalancesStreaming from '@lib/balance/use-binance-balances-streaming';
import {
  Asset,
  assetOf,
  AssetSelector,
  d,
  decimal,
  makeTestModule,
  toArray
} from '@quantform/core';

import { useBinanceBalanceStreaming } from './use-binance-balance-streaming';

describe(useBinanceBalanceStreaming.name, () => {
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

    expect(changes).toEqual([expect.any(Error)]);
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
    givenAssetReceived(assetOrError: AssetSelector | Error) {
      jest.spyOn(useBinanceAsset, 'useBinanceAsset').mockReturnValue(
        assetOrError instanceof AssetSelector
          ? of(new Asset(assetOrError.name, assetOrError.adapterName, 8))
          : defer(() => {
              throw assetOrError;
            })
      );
    },
    givenBalancesReceived(
      balances: {
        asset: AssetSelector;
        available: decimal;
        unavailable: decimal;
      }[]
    ) {
      jest
        .spyOn(useBinanceBalancesStreaming, 'useBinanceBalancesStreaming')
        .mockReturnValue(
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
      return act(() => useBinanceBalanceStreaming(asset));
    }
  };
}
