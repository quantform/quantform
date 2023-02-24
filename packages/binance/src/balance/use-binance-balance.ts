import { map, of, switchMap } from 'rxjs';

import { assetNotSupported, useBinanceAsset } from '@lib/asset';
import { AssetSelector, distinctUntilTimestampChanged } from '@quantform/core';

import { useBinanceBalances } from './use-binance-balances';

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
