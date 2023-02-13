import { map, of, switchMap } from 'rxjs';

import { assetNotSupported, useBinanceAsset } from '@lib/asset';
import { AssetSelector, distinctUntilTimestampChanged } from '@quantform/core';

import { useBinanceBalances } from './use-binance-balances';

/**
 * Adds two numbers together.
 * @example
 * Here's a simple example:
 * ```
 * // Prints "2":
 * console.log(add(1,1));
 * ```
 * @example
 * Here's an example with negative numbers:
 * ```
 * // Prints "0":
 * console.log(add(1,-1));
 * ```
 */
export function useBinanceBalance(asset: AssetSelector) {
  return useBinanceAsset(asset).pipe(
    switchMap(it =>
      it !== assetNotSupported
        ? useBinanceBalances().pipe(
            map(it => it[asset.id]),
            distinctUntilTimestampChanged()
          )
        : of(assetNotSupported)
    )
  );
}
