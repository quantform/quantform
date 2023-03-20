import { concatAll, from, map, of, switchMap } from 'rxjs';

import { Asset, decimal, withShare } from '@quantform/core';

import { useBalanceSocket } from './use-balance-socket';
import { useBalancesRequest } from './use-balances-request';

export type BinanceBalance = {
  timestamp: number;
  asset: Asset;
  available: decimal;
  unavailable: decimal;
};

/**
 * @title useBinanceBalances
 * @description
 * This hook is designed to provide a way to keep track of the balances of all assets
 * in a user's Binance account and respond to any changes in real-time. It returns
 * a read-only observable of the balances.
 *
 * It uses the WebSocket to subscribe to updates to the user's Binance account.
 */
export const useBalances = withShare(() =>
  useBalancesRequest().pipe(
    switchMap(snapshot =>
      from([
        of(snapshot),
        useBalanceSocket().pipe(
          map(it => {
            const balance = snapshot[it.assetSelector];

            if (balance) {
              balance.timestamp = it.timestamp;
              balance.available = it.available;
              balance.unavailable = it.unavailable;
            }

            return snapshot;
          })
        )
      ]).pipe(concatAll())
    )
  )
);
