import { concatAll, from, of, switchMap } from 'rxjs';

import { Asset, decimal, withShare } from '@quantform/core';

import { useBalanceChanges } from './use-balance-changes';
import { useBalancesSnapshot } from './use-balances-snapshot';

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
  useBalancesSnapshot().pipe(
    switchMap(it => from([of(it), useBalanceChanges(it)]).pipe(concatAll()))
  )
);
