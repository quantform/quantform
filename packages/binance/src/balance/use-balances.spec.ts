import { of, ReplaySubject } from 'rxjs';

import { useAssets } from '@lib/asset';
import { useAccountSnapshot } from '@lib/use-account-snapshot';
import { useUserChanges } from '@lib/use-user-changes';
import {
  Asset,
  assetOf,
  AssetSelector,
  d,
  expectSequence,
  makeTestModule,
  mockedFunc
} from '@quantform/core';

import { useBalances } from './use-balances';

jest.mock('@lib/asset', () => ({
  ...jest.requireActual('@lib/asset'),
  useBinanceAssets: jest.fn()
}));

jest.mock('@lib/use-account', () => ({
  ...jest.requireActual('@lib/use-account'),
  useBinanceAccount: jest.fn()
}));

jest.mock('@lib/use-user-socket', () => ({
  ...jest.requireActual('@lib/use-user-socket'),
  useBinanceUserSocket: jest.fn()
}));

describe(useBalances.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  afterEach(() => fixtures.clear());

  test('emit record of balances when subscription started', async () => {
    const { act } = fixtures;

    fixtures.givenAssetsSupported([
      assetOf('binance:btc'),
      assetOf('binance:usdt'),
      assetOf('binance:ape')
    ]);

    fixtures.givenAccountResponse({
      balances: [
        { asset: 'BTC', free: '0.00540992', locked: '0.00000000' },
        { asset: 'USDT', free: '0.07843133', locked: '0.00000000' },
        { asset: 'SBTC', free: '0.00000118', locked: '0.00000000' },
        { asset: 'APE', free: '10.62704000', locked: '0.50000000' }
      ]
    });

    fixtures.givenUserSocketPayload({
      e: 'outboundAccountPosition',
      E: 1651489825575,
      u: 1651489825574,
      B: [
        { a: 'BNB', f: '0.00000000', l: '0.00000000' },
        { a: 'USDT', f: '0.07843133', l: '0.00000000' },
        { a: 'APE', f: '11.12704000', l: '0.00000000' }
      ]
    });

    const sequence = act(() => useBalances());

    await expectSequence(sequence, [
      {
        'binance:btc': {
          timestamp: expect.any(Number),
          asset: expect.objectContaining({
            name: 'btc'
          }),
          available: d(0.00540992),
          unavailable: d(0.0)
        },
        'binance:usdt': {
          timestamp: expect.any(Number),
          asset: expect.objectContaining({
            name: 'usdt'
          }),
          available: d(0.07843133),
          unavailable: d(0.0)
        },
        'binance:ape': {
          timestamp: expect.any(Number),
          asset: expect.objectContaining({
            name: 'ape'
          }),
          available: d(10.62704),
          unavailable: d(0.5)
        }
      },
      {
        'binance:btc': {
          timestamp: expect.any(Number),
          asset: expect.objectContaining({
            name: 'btc'
          }),
          available: d(0.00540992),
          unavailable: d(0.0)
        },
        'binance:usdt': {
          timestamp: expect.any(Number),
          asset: expect.objectContaining({
            name: 'usdt'
          }),
          available: d(0.07843133),
          unavailable: d(0.0)
        },
        'binance:ape': {
          timestamp: expect.any(Number),
          asset: expect.objectContaining({
            name: 'ape'
          }),
          available: d(11.12704),
          unavailable: d(0)
        }
      }
    ]);

    fixtures.thenUseBinanceAccountCalledOnce();
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  const useBinanceAssetsMock = mockedFunc(useAssets);
  const useBinanceAccountMock = mockedFunc(useAccountSnapshot);

  const userSocket = new ReplaySubject<{ timestamp: number; payload: any }>();
  mockedFunc(useUserChanges).mockReturnValue(userSocket.asObservable());

  return {
    act,
    givenAssetsSupported(assets: AssetSelector[]) {
      useBinanceAssetsMock.mockReturnValue(
        of(
          assets.reduce((it, asset) => {
            it[asset.id] = new Asset(asset.name, asset.adapterName, 8);

            return it;
          }, {} as Record<string, Asset>)
        )
      );
    },
    givenAccountResponse(response: any) {
      useBinanceAccountMock.mockReturnValue(of(response));
    },
    givenUserSocketPayload(payload: any) {
      userSocket.next({
        timestamp: 0,
        payload
      });
    },
    thenUseBinanceAccountCalledOnce() {
      expect(useBinanceAccountMock).toBeCalledTimes(1);
    },
    clear: jest.clearAllMocks
  };
}
