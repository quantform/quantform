import { map, of, switchMap, takeWhile } from 'rxjs';

import { assetNotSupported, useBinanceAsset } from '@lib/asset';
import { AssetSelector, distinctUntilTimestampChanged } from '@quantform/core';

import { useBinanceBalances } from './use-binance-balances';

export function useBinanceBalance(asset: AssetSelector) {
  return useBinanceAsset(asset).pipe(
    switchMap(it =>
      it !== assetNotSupported
        ? useBinanceBalances().pipe(
            map(it => it[asset.id]),
            takeWhile(it => it !== undefined),
            distinctUntilTimestampChanged()
          )
        : of(assetNotSupported)
    )
  );
}
