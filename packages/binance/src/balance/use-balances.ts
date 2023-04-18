import { map, merge, retry, skipUntil } from 'rxjs';

import { Asset, decimal, use } from '@quantform/core';

import { useBalanceSocket } from './use-balance-socket';
import { useBalancesSnapshot } from './use-balances-snapshot';

/**
 * @title useBinanceBalances
 * @description
 * This hook is designed to provide a way to keep track of the balances of all assets
 * in a user's Binance account and respond to any changes in real-time. It returns
 * a read-only observable of the balances.
 *
 * It uses the WebSocket to subscribe to updates to the user's Binance account.
 */
export const useBalances = use(() => {
  const balances = {} as Record<
    string,
    {
      timestamp: number;
      asset: Asset;
      free: decimal;
      locked: decimal;
    }
  >;

  const snapshot = useBalancesSnapshot();

  return merge(snapshot, useBalanceSocket().pipe(skipUntil(snapshot))).pipe(
    map(it => {
      it.forEach(it => {
        const balance = balances[it.asset.id] ?? (balances[it.asset.id] = it);

        balance.timestamp = it.timestamp;
        balance.free = it.free;
        balance.locked = it.locked;
      });

      return balances;
    }),
    retry({ delay: 3000 })
  );
});
