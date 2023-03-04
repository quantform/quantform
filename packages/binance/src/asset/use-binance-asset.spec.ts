import { firstValueFrom, of } from 'rxjs';

import {
  Asset,
  assetOf,
  AssetSelector,
  d,
  expectSequence,
  makeTestModule,
  mockedFunc
} from '@quantform/core';

import { assetNotSupported, useBinanceAsset } from './use-binance-asset';
import { useBinanceAssets } from './use-binance-assets';

jest.mock('./use-binance-assets', () => ({
  ...jest.requireActual('./use-binance-assets'),
  useBinanceAssets: jest.fn()
}));

describe(useBinanceAsset.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  afterEach(() => fixtures.clear());

  test('emit existing asset when subscription started', async () => {
    const { act } = fixtures;

    fixtures.givenAssetSupported('btc', 8);
    fixtures.givenAssetSupported('eth', 6);

    const sequence = act(() => useBinanceAsset(assetOf('binance:eth')));

    await expectSequence(sequence, [
      {
        id: 'binance:eth',
        adapterName: 'binance',
        name: 'eth',
        scale: 6,
        tickSize: d(0.000001)
      }
    ]);
  });

  test('emit error when subscription started for not existing asset', async () => {
    const { act } = fixtures;

    fixtures.givenAssetSupported('btc', 8);
    fixtures.givenAssetSupported('eth', 6);

    const sequence = act(() => useBinanceAsset(assetOf('binance:xmr')));

    await expectSequence(sequence, [assetNotSupported]);
  });

  test('emit always same instance of asset', async () => {
    const { act } = fixtures;

    fixtures.givenAssetSupported('btc', 8);
    fixtures.givenAssetSupported('eth', 6);

    const one = await firstValueFrom(act(() => useBinanceAsset(assetOf('binance:btc'))));
    const two = await firstValueFrom(act(() => useBinanceAsset(assetOf('binance:btc'))));

    expect(Object.is(one, two)).toBeTruthy();
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  const assets: Record<string, Asset> = {};

  mockedFunc(useBinanceAssets).mockImplementation(() => of(assets));

  return {
    act,
    givenAssetSupported(asset: string, scale: number) {
      const selector = new AssetSelector(asset, 'binance');

      assets[selector.id] = new Asset(asset, 'binance', scale);
    },
    clear: jest.clearAllMocks
  };
}
