import { map, merge, retry, skipUntil } from 'rxjs';

import { Asset, decimal, use } from '@quantform/core';

import { useBinanceBalanceSocket } from './use-binance-balance-socket';
import { useBinanceBalances } from './use-binance-balances';

/**
 * @title useBinanceBalancesStreaming()
 *
 * `useBinanceBalancesStreaming(): Observable`
 *
 * Streams the Binance account balance changes for the current user in real-time
 * by merging snapshot data with balance socket data.
 *
 * @example
 * ```
 * // pipes a collection of changed balances
 * const changes = useBinanceBalancesStreaming().pipe(
 *   startWith([]),
 *   pairwise(),
 *   map(([prev, curr]) =>
 *     Object.values(curr).filter(lhs => {
 *       const rhs = Object.values(prev).find(it => it.asset.id === lhs.asset.id);
 *
 *       return !rhs || !lhs.free.eq(rhs.free) || lhs.locked.eq(rhs.locked);
 *     })
 *   )
 * );
 * ```
 */
export const useBinanceBalancesStreaming = use(() => {
  const balances = {} as Record<
    string,
    {
      timestamp: number;
      asset: Asset;
      free: decimal;
      locked: decimal;
    }
  >;

  const snapshot = useBinanceBalances();

  return merge(snapshot, useBinanceBalanceSocket().pipe(skipUntil(snapshot))).pipe(
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
