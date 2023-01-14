import { combineLatest, map, Observable, shareReplay } from 'rxjs';

import {
  Asset,
  AssetSelector,
  d,
  decimal,
  useMemo,
  useTimestamp,
  withMemo
} from '@quantform/core';

import { useBinanceAccount } from '@lib/use-binance-account';
import { useBinanceAssets } from '@lib/use-binance-assets';

export type BinanceBalance = {
  timestamp: number;
  asset: Asset;
  available: decimal;
  unavailable: decimal;
};

export const useBinanceBalances = withMemo(binanceBalances);

function binanceBalances(): Observable<Record<string, BinanceBalance>> {
  const snapshot = useMemo<Record<string, BinanceBalance>>(
    () => ({}),
    [binanceBalances.name]
  );

  return combineLatest([useBinanceAssets(), useBinanceAccount()]).pipe(
    map(([assets, account]) =>
      account.balances.reduce((_, it) => {
        const { id, free, locked } = mapBinanceToBalance(it);

        const balance = snapshot[id];
        if (balance) {
          balance.timestamp = useTimestamp();
          balance.available = free;
          balance.unavailable = locked;
        } else {
          const asset = assets[id];
          if (!asset) {
            console.log('missing asset: ', id);

            return;
          }

          snapshot[id] = {
            timestamp: useTimestamp(),
            asset,
            available: free,
            unavailable: locked
          };
        }

        return snapshot;
      }, snapshot)
    ),
    shareReplay(1)
  );
}

export function mapBinanceToBalance(response: any) {
  return {
    id: new AssetSelector(response.asset.toLowerCase(), 'binance').id,
    free: d(response.free),
    locked: d(response.locked)
  };
}
