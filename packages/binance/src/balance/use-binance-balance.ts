import { map, of, switchMap } from 'rxjs';

import { assetNotSupported, useBinanceAsset } from '@lib/asset';
import {
  asReadonly,
  AssetSelector,
  distinctUntilTimestampChanged
} from '@quantform/core';

import { useBinanceBalances } from './use-binance-balances';

/**
 * @title useBinanceBalance
 */
export function useBinanceBalance(asset: AssetSelector) {
  const balances = useBinanceBalances();

  return useBinanceAsset(asset).pipe(
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
}
