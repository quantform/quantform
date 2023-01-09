import { combineLatest, map, Observable, shareReplay } from 'rxjs';

import { AssetSelector, Balance, d, useMemo, withMemo } from '@quantform/core';

import { useBinanceAccount } from '@lib/use-binance-account';
import { useBinanceAssets } from '@lib/use-binance-assets';

export const useBinanceBalances = withMemo(binanceBalances);

function binanceBalances(): Observable<Record<string, Balance>> {
  const snapshot = useMemo<Record<string, Balance>>(() => ({}), [binanceBalances.name]);

  return combineLatest([useBinanceAssets(), useBinanceAccount()]).pipe(
    map(([assets, account]) =>
      account.balances.reduce((_, it) => {
        const { id, free, locked } = mapBinanceToBalanceLoadEvent(it);

        const balance = snapshot[id];
        if (balance) {
          balance.available = free;
          balance.unavailable = locked;
        } else {
          const asset = assets[id];
          if (!asset) {
            console.log('missing asset: ', id);

            return;
          }

          snapshot[id] = new Balance(0, asset, free, locked);
        }

        return snapshot;
      }, snapshot)
    ),
    shareReplay(1)
  );
}

export function mapBinanceToBalanceLoadEvent(response: any) {
  return {
    id: new AssetSelector(response.asset.toLowerCase(), 'binance').id,
    free: d(response.free),
    locked: d(response.locked)
  };
}
