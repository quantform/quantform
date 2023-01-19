import { combineLatest, map, Observable, shareReplay } from 'rxjs';

import {
  Asset,
  AssetSelector,
  d,
  decimal,
  useState,
  useTimestamp
} from '@quantform/core';

import { useBinanceAccount } from '@lib/use-binance-account';
import { useBinanceAssets } from '@lib/use-binance-assets';

export type BinanceBalance = {
  timestamp: number;
  asset: Asset;
  available: decimal;
  unavailable: decimal;
};

export function useBinanceBalances() {
  const [balances] = useState(binanceBalances(), [useBinanceBalances.name]);

  return balances;
}

function binanceBalances(): Observable<Record<string, BinanceBalance>> {
  const balances = useState<Record<string, BinanceBalance>>({}, [binanceBalances.name]);

  return combineLatest([useBinanceAssets(), useBinanceAccount()]).pipe(
    map(([assets, account]) =>
      account.balances.reduce((balances, it) => {
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
    shareReplay(1)
  );
}

function mapBinanceToBalance(response: any) {
  return {
    id: new AssetSelector(response.asset.toLowerCase(), 'binance').id,
    free: d(response.free),
    locked: d(response.locked)
  };
}
