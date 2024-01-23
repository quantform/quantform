import { map, merge, skipUntil } from 'rxjs';

import { Asset, decimal, withMemo } from '@quantform/core';

import { useBinanceBalanceSocket } from './api/use-binance-balance-socket';
import { withBalances } from './with-balances';

export const whenBalances = withMemo(() => {
  const balances = {} as Record<
    string,
    {
      timestamp: number;
      asset: Asset;
      free: decimal;
      locked: decimal;
    }
  >;

  const snapshot = withBalances();

  return merge(snapshot, useBinanceBalanceSocket().pipe(skipUntil(snapshot))).pipe(
    map(it => {
      it.forEach(it => {
        const balance = balances[it.asset.id] ?? (balances[it.asset.id] = it);

        balance.timestamp = it.timestamp;
        balance.free = it.free;
        balance.locked = it.locked;
      });

      return balances;
    })
  );
});
