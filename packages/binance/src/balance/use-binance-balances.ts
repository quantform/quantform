import {
  combineLatest,
  concat,
  filter,
  map,
  Observable,
  retry,
  shareReplay,
  take
} from 'rxjs';

import { useBinanceAssets } from '@lib/asset';
import { useBinanceAccount } from '@lib/use-binance-account';
import { useBinanceUserSocket } from '@lib/use-binance-user-socket';
import { Asset, AssetSelector, d, decimal, useMemo, useTimestamp } from '@quantform/core';

export type BinanceBalance = {
  timestamp: number;
  asset: Asset;
  available: decimal;
  unavailable: decimal;
};

export function useBinanceBalances() {
  return useMemo(() => binanceBalances(), [useBinanceBalances.name]);
}

function binanceBalances(): Observable<Record<string, BinanceBalance>> {
  const balances = {} as Record<string, BinanceBalance>;

  const start = combineLatest([useBinanceAssets(), useBinanceAccount()]).pipe(
    map(([assets, account]) =>
      account.balances.reduce((balances: Record<string, BinanceBalance>, it) => {
        const { id, free, locked } = mapBinanceToBalance(it);

        const balance = balances[id];
        if (balance) {
          balance.timestamp = useTimestamp();
          balance.available = free;
          balance.unavailable = locked;
        } else {
          const asset = assets[id];

          if (asset) {
            balances[id] = {
              timestamp: useTimestamp(),
              asset,
              available: free,
              unavailable: locked
            };
          }
        }

        return balances;
      }, balances)
    ),
    take(1)
  );

  return concat(
    start,
    useBinanceUserSocket().pipe(
      filter(it => it.payload.e === 'outboundAccountPosition'),
      map(it => {
        it.payload.B.forEach(payload => {
          const id = `binance:${payload.a.toLowerCase()}`;

          balances[id].timestamp = it.timestamp;
          balances[id].available = d(payload.f);
          balances[id].unavailable = d(payload.l);
        });

        return balances;
      }),

      shareReplay(1)
    )
  );
}

function mapBinanceToBalance(response: any) {
  return {
    id: new AssetSelector(response.asset.toLowerCase(), 'binance').id,
    free: d(response.free),
    locked: d(response.locked)
  };
}
