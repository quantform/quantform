import { of, tap } from 'rxjs';

import {
  Asset,
  assetNotSupported,
  assetOf,
  AssetSelector,
  makeTestModule
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

    const changes = fixtures.whenAssetResolved(assetOf('binance:eth'));

    expect(changes).toEqual([expect.objectContaining({ id: 'binance:eth' })]);
  });

  test('pipe asset when received new assets for existing subscription', async () => {
    const changes = fixtures.whenAssetResolved(assetOf('binance:eth'));

    fixtures.givenAssetsReceived([assetOf('binance:btc'), assetOf('binance:eth')]);

    expect(changes).toEqual([expect.objectContaining({ id: 'binance:eth' })]);
  });

  test('pipe asset not found for missing asset', async () => {
    fixtures.givenAssetsReceived([assetOf('binance:btc'), assetOf('binance:eth')]);

    const changes = fixtures.whenAssetResolved(assetOf('binance:xmr'));

    expect(changes).toEqual([assetNotSupported]);
  });

  test('pipe the same instance of asset for same selector', async () => {
    fixtures.givenAssetsReceived([assetOf('binance:btc'), assetOf('binance:eth')]);

    const [one] = fixtures.whenAssetResolved(assetOf('binance:btc'));
    const [two] = fixtures.whenAssetResolved(assetOf('binance:btc'));

    expect(Object.is(one, two)).toBeTruthy();
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  return {
    act,
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
      const array = Array.of<typeof assetNotSupported | Asset>();

      act(() => useAsset(selector))
        .pipe(tap(it => array.push(it)))
        .subscribe();

      return array;
    }
  };
}
