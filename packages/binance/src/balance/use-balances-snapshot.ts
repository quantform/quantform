import { combineLatest, map } from 'rxjs';

import { useAssets } from '@lib/asset';
import { useAccountSnapshot } from '@lib/use-account-snapshot';
import { AssetSelector, d, useTimestamp } from '@quantform/core';

import { BinanceBalance } from './use-balances';

export const useBalancesSnapshot = () =>
  combineLatest([useAssets(), useAccountSnapshot()]).pipe(
    map(([assets, account]) =>
      account.balances.reduce((balances: Record<string, BinanceBalance>, it) => {
        const id = new AssetSelector(it.asset.toLowerCase(), 'binance').id;
        const free = d(it.free);
        const locked = d(it.locked);

        const timestamp = useTimestamp();

        const balance = balances[id];
        if (balance) {
          balance.timestamp = timestamp;
          balance.available = free;
          balance.unavailable = locked;
        } else {
          const asset = assets[id];

          if (asset) {
            balances[id] = {
              timestamp,
              asset,
              available: free,
              unavailable: locked
            };
          }
        }

        return balances;
      }, {} as Record<string, BinanceBalance>)
    )
  );
