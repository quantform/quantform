import { firstValueFrom, of } from 'rxjs';

import { useAsset } from '@lib/asset';
import {
  Asset,
  assetNotSupported,
  assetOf,
  d,
  decimal,
  expectSequence,
  makeTestModule,
  mockedFunc
} from '@quantform/core';

import { useBalance } from './use-balance';
import { BinanceBalance, useBalances } from './use-balances';

jest.mock('@lib/asset', () => ({
  ...jest.requireActual('@lib/asset'),
  useBinanceAsset: jest.fn()
}));

jest.mock('./use-balances', () => ({
  ...jest.requireActual('./use-balances'),
  useBinanceBalances: jest.fn()
}));

describe(useBalance.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  afterEach(() => fixtures.clear());

  test('emit existing balance when subscription started', async () => {
    const { act, assets } = fixtures;

    fixtures.givenUseBinanceAssetMock(assets.btc);
    fixtures.givenUseBinanceBalancesMock([
      { asset: assets.btc, available: d(1), unavailable: d.Zero }
    ]);

    const sequence = act(() => useBalance(assets.btc));

    await expectSequence(sequence, [
      {
        timestamp: expect.any(Number),
        asset: assets.btc,
        available: d(1),
        unavailable: d.Zero
      }
    ]);
  });

  test('emit error when subscription started for not existing balance', async () => {
    const { act, assets } = fixtures;

    fixtures.givenUseBinanceAssetMock(assets.btc);
    fixtures.givenUseBinanceBalancesMock([
      { asset: assets.btc, available: d(1), unavailable: d.Zero }
    ]);

    const sequence = act(() => useBalance(assetOf('binance:xmr')));

    await expectSequence(sequence, [assetNotSupported]);
  });

  test('emit error when subscription started for not existing asset', async () => {
    const { act, assets } = fixtures;

    fixtures.givenUseBinanceAssetMock(assetNotSupported);
    fixtures.givenUseBinanceBalancesMock([
      { asset: assets.btc, available: d(1), unavailable: d.Zero }
    ]);

    const sequence = act(() => useBalance(assets.btc));

    await expectSequence(sequence, [assetNotSupported]);
  });

  test('emit always same instance of balance', async () => {
    const { act, assets } = fixtures;

    fixtures.givenUseBinanceAssetMock(assets.btc);
    fixtures.givenUseBinanceBalancesMock([
      { asset: assets.btc, available: d(1), unavailable: d.Zero }
    ]);

    const one = await firstValueFrom(act(() => useBalance(assets.btc)));
    const two = await firstValueFrom(act(() => useBalance(assets.btc)));

    expect(Object.is(one, two)).toBeTruthy();
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  return {
    act,
    assets: {
      btc: new Asset('btc', 'binance', 8)
    },
    givenUseBinanceAssetMock(asset: Asset | typeof assetNotSupported) {
      mockedFunc(useAsset).mockReturnValue(of(asset));
    },
    givenUseBinanceBalancesMock(
      balances: {
        asset: Asset;
        available: decimal;
        unavailable: decimal;
      }[]
    ) {
      mockedFunc(useBalances).mockReturnValue(
        of(
          balances.reduce((snapshot, { asset, available, unavailable }) => {
            snapshot[asset.id] = {
              asset,
              available,
              unavailable,
              timestamp: 0
            };

            return snapshot;
          }, {} as Record<string, BinanceBalance>)
        )
      );
    },
    clear: jest.clearAllMocks
  };
}
