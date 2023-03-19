import { map, of, switchMap } from 'rxjs';

import { useAsset } from '@lib/asset';
import {
  asReadonly,
  assetNotSupported,
  AssetSelector,
  distinctUntilTimestampChanged
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
export const useBalance = (asset: AssetSelector) => {
  const balances = useBalances();

  return useAsset(asset).pipe(
    switchMap(it =>
      it !== assetNotSupported
        ? balances.pipe(
            map(it => it[asset.id] ?? assetNotSupported),
            distinctUntilTimestampChanged()
          )
        : of(assetNotSupported)
    ),
    asReadonly()
  );
};
