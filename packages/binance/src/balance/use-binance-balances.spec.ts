import { of, ReplaySubject, tap } from 'rxjs';

import { useBinanceAssets } from '@lib/asset';
import { useBinanceAccount } from '@lib/use-binance-account';
import { useBinanceUserSocket } from '@lib/use-binance-user-socket';
import {
  Asset,
  assetOf,
  AssetSelector,
  d,
  expectSequence,
  makeTestModule,
  mockedFunc
} from '@quantform/core';

import { useBinanceBalances } from './use-binance-balances';

jest.mock('@lib/asset', () => ({
  ...jest.requireActual('@lib/asset'),
  useBinanceAssets: jest.fn()
}));

jest.mock('@lib/use-binance-account', () => ({
  ...jest.requireActual('@lib/use-binance-account'),
  useBinanceAccount: jest.fn()
}));

jest.mock('@lib/use-binance-user-socket', () => ({
  ...jest.requireActual('@lib/use-binance-user-socket'),
  useBinanceUserSocket: jest.fn()
}));

describe(useBinanceBalances.name, () => {
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

    const sequence = act(() => useBinanceBalances());

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
  /*
  test('emit always same instance of array of asset', async () => {
    const { act } = fixtures;

    fixtures.givenAssetBalance(instrumentOf('binance:btc-usdt'));
    fixtures.givenAssetBalance(instrumentOf('binance:btc-bust'));
    fixtures.givenAssetBalance(instrumentOf('binance:btc-usdc'));

    const one = await firstValueFrom(act(() => useBinanceAssets()));
    const two = await firstValueFrom(act(() => useBinanceAssets()));

    expect(Object.is(one, two)).toBeTruthy();
    fixtures.thenUseBinanceInstrumentsCalledOnce();
  });*/
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  const useBinanceAssetsMock = mockedFunc(useBinanceAssets);
  const useBinanceAccountMock = mockedFunc(useBinanceAccount);

  const userSocket = new ReplaySubject<{ timestamp: number; payload: any }>();
  mockedFunc(useBinanceUserSocket).mockReturnValue(userSocket.asObservable());

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
