import { map, ReplaySubject } from 'rxjs';

import * as useBalanceSocket from '@lib/balance/use-balance-socket';
import * as useBalancesSnapshot from '@lib/balance/use-balances-snapshot';
import {
  Asset,
  assetOf,
  AssetSelector,
  d,
  decimal,
  makeTestModule,
  toArray
} from '@quantform/core';

import { BinanceBalance, useBalances } from './use-balances';

describe(useBalances.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('pipe a balance snapshot when no balance change received', async () => {
    const changes = toArray(fixtures.whenBalancesResolved());

    fixtures.givenBalanceSnapshotReceived(0, [
      { asset: assetOf('binance:btc'), available: d(1), unavailable: d(2) }
    ]);

    expect(changes).toEqual([
      {
        'binance:btc': {
          timestamp: expect.any(Number),
          asset: expect.objectContaining({
            name: 'btc'
          }),
          available: d(1),
          unavailable: d(2)
        }
      }
    ]);
  });

  test('do not pipe socket changes when no snapshot', async () => {
    const changes = toArray(fixtures.whenBalancesResolved());

    fixtures.givenBalanceReceived({
      timestamp: 1,
      asset: assetOf('binance:btc'),
      available: d(3),
      unavailable: d(4)
    });

    expect(changes).toEqual([]);
  });

  test('emit record of balances when subscription started', async () => {
    const changes = toArray(fixtures.whenBalancesResolved());

    fixtures.givenBalanceSnapshotReceived(0, [
      { asset: assetOf('binance:btc'), available: d(1), unavailable: d(2) }
    ]);

    fixtures.givenBalanceReceived({
      timestamp: 1,
      asset: assetOf('binance:btc'),
      available: d(3),
      unavailable: d(4)
    });

    expect(changes).toEqual([
      {
        'binance:btc': {
          timestamp: expect.any(Number),
          asset: expect.objectContaining({
            name: 'btc'
          }),
          available: d(1),
          unavailable: d(2)
        }
      },
      {
        'binance:btc': {
          timestamp: expect.any(Number),
          asset: expect.objectContaining({
            name: 'btc'
          }),
          available: d(3),
          unavailable: d(4)
        }
      }
    ]);
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  const message = new ReplaySubject<any>();
  jest
    .spyOn(useBalanceSocket, 'useBalanceSocket')
    .mockReturnValue(message.asObservable());

  const snapshot = new ReplaySubject<Record<string, BinanceBalance>>();
  jest
    .spyOn(useBalancesSnapshot, 'useBalancesSnapshot')
    .mockReturnValue(snapshot.asObservable());

  return {
    givenBalanceSnapshotReceived(
      timestamp: number,
      balances: { asset: AssetSelector; available: decimal; unavailable: decimal }[]
    ) {
      snapshot.next(
        balances.reduce((agg, it) => {
          agg[it.asset.id] = {
            timestamp,
            asset: new Asset(it.asset.name, it.asset.adapterName, 8),
            available: it.available,
            unavailable: it.unavailable
          };

          return agg;
        }, {} as Record<string, BinanceBalance>)
      );
    },
    givenBalanceReceived(balance: {
      timestamp: number;
      asset: AssetSelector;
      available: decimal;
      unavailable: decimal;
    }) {
      message.next(balance);
    },
    whenBalancesResolved() {
      return act(() =>
        useBalances().pipe(
          map(it =>
            Object.keys(it).reduce((agg, key) => {
              agg[key] = { ...it[key] };

              return agg;
            }, {} as Record<string, BinanceBalance>)
          )
        )
      );
    }
  };
}
