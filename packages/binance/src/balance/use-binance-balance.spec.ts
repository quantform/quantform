import { firstValueFrom, of } from 'rxjs';

import { assetNotSupported, useBinanceAsset } from '@lib/asset';
import {
  Asset,
  assetOf,
  d,
  decimal,
  expectSequence,
  makeTestModule,
  mockedFunc
} from '@quantform/core';

import { useBinanceBalance } from './use-binance-balance';
import { BinanceBalance, useBinanceBalances } from './use-binance-balances';

jest.mock('@lib/asset', () => ({
  ...jest.requireActual('@lib/asset'),
  useBinanceAsset: jest.fn()
}));

jest.mock('./use-binance-balances', () => ({
  ...jest.requireActual('./use-binance-balances'),
  useBinanceBalances: jest.fn()
}));

describe(useBinanceBalance.name, () => {
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

    const sequence = act(() => useBinanceBalance(assets.btc));

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

    const sequence = act(() => useBinanceBalance(assetOf('binance:xmr')));

    await expectSequence(sequence, [assetNotSupported]);
  });

  test('emit error when subscription started for not existing asset', async () => {
    const { act, assets } = fixtures;

    fixtures.givenUseBinanceAssetMock(assetNotSupported);
    fixtures.givenUseBinanceBalancesMock([
      { asset: assets.btc, available: d(1), unavailable: d.Zero }
    ]);

    const sequence = act(() => useBinanceBalance(assets.btc));

    await expectSequence(sequence, [assetNotSupported]);
  });

  test('emit always same instance of balance', async () => {
    const { act, assets } = fixtures;

    fixtures.givenUseBinanceAssetMock(assets.btc);
    fixtures.givenUseBinanceBalancesMock([
      { asset: assets.btc, available: d(1), unavailable: d.Zero }
    ]);

    const one = await firstValueFrom(act(() => useBinanceBalance(assets.btc)));
    const two = await firstValueFrom(act(() => useBinanceBalance(assets.btc)));

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
      mockedFunc(useBinanceAsset).mockReturnValue(of(asset));
    },
    givenUseBinanceBalancesMock(
      balances: {
        asset: Asset;
        available: decimal;
        unavailable: decimal;
      }[]
    ) {
      mockedFunc(useBinanceBalances).mockReturnValue(
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
