import { map } from 'rxjs';

import {
  AssetSelector,
  distinctUntilTimestampChanged,
  notFound,
  use
} from '@quantform/core';

import { useBalances } from './use-balances';

/**
 * @title useBinanceBalance
 * @description
 * This hook is designed to be used to retrieve the balance of a specified asset in
 * the user's Binance account. The function takes one argument, `asset`, which is an
 * object that represents the asset to retrieve the balance for.
 *
 * If the asset is not supported by Binance, the function returns an observable that
 * emits `assetNotSupported`.
 */
export const useBalance = use((asset: AssetSelector) =>
  useBalances().pipe(
    map(it => it[asset.id] ?? notFound),
    distinctUntilTimestampChanged()
  )
);
