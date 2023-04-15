import { firstValueFrom, map, of } from 'rxjs';

import {
  Asset,
  assetOf,
  AssetSelector,
  makeTestModule,
  notFound,
  toArray
} from '@quantform/core';

import { useAsset } from './use-asset';
import * as useAssets from './use-assets';

describe(useAsset.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('pipe asset when subscription started', async () => {
    fixtures.givenAssetsReceived([assetOf('binance:btc'), assetOf('binance:eth')]);

    const changes = toArray(fixtures.whenAssetResolved(assetOf('binance:eth')));

    expect(changes).toEqual([expect.objectContaining({ id: 'binance:eth' })]);
  });

  test('pipe asset when received new assets for existing subscription', async () => {
    const changes = toArray(fixtures.whenAssetResolved(assetOf('binance:eth')));

    fixtures.givenAssetsReceived([assetOf('binance:btc'), assetOf('binance:eth')]);

    expect(changes).toEqual([expect.objectContaining({ id: 'binance:eth' })]);
  });

  test('pipe asset not found for not existing asset', async () => {
    fixtures.givenAssetsReceived([assetOf('binance:btc'), assetOf('binance:eth')]);

    const changes = toArray(fixtures.whenAssetResolved(assetOf('binance:xmr')));

    expect(changes).toEqual([notFound]);
  });

  test('pipe the same instance of asset for same selector', async () => {
    fixtures.givenAssetsReceived([assetOf('binance:btc'), assetOf('binance:eth')]);

    const one = await firstValueFrom(fixtures.whenAssetResolved(assetOf('binance:btc')));
    const two = await firstValueFrom(fixtures.whenAssetResolved(assetOf('binance:btc')));

    expect(Object.is(one, two)).toBeTruthy();
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  return {
    givenAssetsReceived(assets: AssetSelector[]) {
      jest.spyOn(useAssets, 'useAssets').mockReturnValue(
        of(
          assets.reduce((agg, it) => {
            agg[it.id] = new Asset(it.name, it.adapterName, 8);
            return agg;
          }, {} as Record<string, Asset>)
        )
      );
    },
    whenAssetResolved(selector: AssetSelector) {
      return act(() =>
        useAsset(selector).pipe(map(it => (it === notFound ? notFound : { ...it })))
      );
    }
  };
}
