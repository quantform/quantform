import { map, ReplaySubject } from 'rxjs';

import * as useBinanceBalanceSocket from '@lib/balance/use-binance-balance-socket';
import * as useBinanceBalancesSnapshot from '@lib/balance/use-binance-balances-snapshot';
import {
  Asset,
  assetOf,
  AssetSelector,
  d,
  decimal,
  makeTestModule,
  toArray
} from '@quantform/core';

import { useBinanceBalances } from './use-binance-balances';

describe(useBinanceBalances.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('pipe a balance snapshot when no balance change received', async () => {
    const changes = toArray(fixtures.whenBalancesResolved());

    fixtures.givenBalanceSnapshotReceived(0, [
      { asset: assetOf('binance:btc'), free: d(1), locked: d(2) }
    ]);

    expect(changes).toEqual([
      [fixtures.thenBalanceChanged(assetOf('binance:btc'), d(1), d(2))]
    ]);
  });

  test('do not pipe socket changes when no snapshot', async () => {
    const changes = toArray(fixtures.whenBalancesResolved());

    fixtures.givenBalanceReceived([
      {
        timestamp: 1,
        asset: assetOf('binance:btc'),
        free: d(3),
        locked: d(4)
      }
    ]);

    expect(changes).toEqual([]);
  });

  test('emit record of balances when subscription started', async () => {
    const changes = toArray(fixtures.whenBalancesResolved());

    fixtures.givenBalanceSnapshotReceived(0, [
      { asset: assetOf('binance:btc'), free: d(1), locked: d(2) }
    ]);

    fixtures.givenBalanceReceived([
      {
        timestamp: 1,
        asset: assetOf('binance:btc'),
        free: d(3),
        locked: d(4)
      }
    ]);

    expect(changes).toEqual([
      [fixtures.thenBalanceChanged(assetOf('binance:btc'), d(1), d(2))],
      [fixtures.thenBalanceChanged(assetOf('binance:btc'), d(3), d(4))]
    ]);
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  const message = new ReplaySubject<any>();
  jest
    .spyOn(useBinanceBalanceSocket, 'useBinanceBalanceSocket')
    .mockReturnValue(message.asObservable());

  const snapshot = new ReplaySubject<any>();
  jest
    .spyOn(useBinanceBalancesSnapshot, 'useBinanceBalancesSnapshot')
    .mockReturnValue(snapshot.asObservable());

  return {
    givenBalanceSnapshotReceived(
      timestamp: number,
      balances: { asset: AssetSelector; free: decimal; locked: decimal }[]
    ) {
      snapshot.next(
        balances.map(it => ({
          timestamp,
          asset: new Asset(it.asset.name, it.asset.adapterName, 8),
          free: it.free,
          locked: it.locked
        }))
      );
    },
    givenBalanceReceived(
      balance: {
        timestamp: number;
        asset: AssetSelector;
        free: decimal;
        locked: decimal;
      }[]
    ) {
      message.next(balance);
    },
    whenBalancesResolved() {
      return act(() => useBinanceBalances().pipe(map(it => Object.values(it))));
    },
    thenBalanceChanged(asset: AssetSelector, free: decimal, locked: decimal) {
      return {
        timestamp: expect.any(Number),
        asset: expect.objectContaining({
          name: asset.name
        }),
        free,
        locked
      };
    }
  };
}
