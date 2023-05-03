import { map } from 'rxjs';

import { AssetSelector, distinctUntilTimestampChanged, use } from '@quantform/core';

import { useBinanceBalancesStreaming } from './use-binance-balances-streaming';

/**
 * @title useBinanceBalance()
 * @description
 * This hook is designed to be used to retrieve the balance of a specified asset in
 * the user's Binance account. The function takes one argument, `asset`, which is an
 * object that represents the asset to retrieve the balance for.
 *
 * If the asset is not supported by Binance, the function returns an observable that
 * emits `assetNotSupported`.
 */
export const useBinanceBalanceStreaming = use((asset: AssetSelector) =>
  useBinanceBalancesStreaming().pipe(
    map(it => {
      if (!it[asset.id]) {
        throw new Error('missing asset');
      }

      return it[asset.id];
    }),
    distinctUntilTimestampChanged()
  )
);
