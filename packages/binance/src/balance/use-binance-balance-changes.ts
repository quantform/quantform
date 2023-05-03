import { map } from 'rxjs';

import {
  AssetSelector,
  distinctUntilTimestampChanged,
  MissingAssetError,
  withMemo
} from '@quantform/core';

import { useBinanceBalancesChanges } from './use-binance-balances-changes';

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
export const useBinanceBalanceChanges = withMemo((asset: AssetSelector) =>
  useBinanceBalancesChanges().pipe(
    map(it => {
      if (!it[asset.id]) {
        throw new MissingAssetError(asset);
      }

      return it[asset.id];
    }),
    distinctUntilTimestampChanged()
  )
);
