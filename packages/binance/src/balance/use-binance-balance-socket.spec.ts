import { readFileSync } from 'fs';
import { join } from 'path';
import { of, Subject } from 'rxjs';

import * as useBinanceAssets from '@lib/asset/use-binance-assets';
import * as useBinanceUserSocket from '@lib/user/use-binance-user-socket';
import {
  Asset,
  assetOf,
  AssetSelector,
  d,
  makeTestModule,
  toArray
} from '@quantform/core';

import { useBinanceBalanceSocket } from './use-binance-balance-socket';

describe(useBinanceBalanceSocket.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('pipe a message', () => {
    fixtures.givenAssetsReceived([
      assetOf('binance:bnb'),
      assetOf('binance:usdt'),
      assetOf('binance:ape'),
      assetOf('binance:bnb')
    ]);

    const changes = toArray(fixtures.whenBalanceSocketResolved());

    fixtures.payload.forEach((it, idx) => fixtures.givenPayloadReceived(idx, it));

    expect(changes).toEqual([
      [
        {
          timestamp: 0,
          asset: expect.objectContaining({
            id: 'binance:bnb'
          }),
          free: d(0),
          locked: d(0)
        },
        {
          timestamp: 0,
          asset: expect.objectContaining({
            id: 'binance:usdt'
          }),
          free: d(0.07843133),
          locked: d(0)
        }
      ],
      [
        {
          timestamp: 1,
          asset: expect.objectContaining({
            id: 'binance:ape'
          }),
          free: d(10.62704),
          locked: d(0)
        }
      ],
      [
        {
          timestamp: 2,
          asset: expect.objectContaining({
            id: 'binance:bnb'
          }),
          free: d(2),
          locked: d(0)
        }
      ]
    ]);
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  const message = new Subject();

  jest
    .spyOn(useBinanceUserSocket, 'useBinanceUserSocket')
    .mockReturnValue(message.asObservable() as any);

  return {
    payload: JSON.parse(
      readFileSync(join(__dirname, 'use-binance-balance-socket.payload.json'), 'utf8')
    ) as Array<any>,
    givenAssetsReceived(assets: AssetSelector[]) {
      jest.spyOn(useBinanceAssets, 'useBinanceAssets').mockReturnValue(
        of(
          assets.reduce((agg, it) => {
            agg[it.id] = new Asset(it.name, it.adapterName, 8);
            return agg;
          }, {} as Record<string, Asset>)
        )
      );
    },
    givenPayloadReceived(timestamp: number, payload: any) {
      message.next({ timestamp, payload });
    },
    whenBalanceSocketResolved() {
      return act(() => useBinanceBalanceSocket());
    }
  };
}
