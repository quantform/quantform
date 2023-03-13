import { combineLatest, map } from 'rxjs';

import { useBinanceAssets } from '@lib/asset';
import { useBinanceAccount } from '@lib/use-binance-account';
import { AssetSelector, d, useTimestamp } from '@quantform/core';

import { BinanceBalance } from './use-binance-balances';

export const useBinanceBalancesRequest = () =>
  combineLatest([useBinanceAssets(), useBinanceAccount()]).pipe(
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
