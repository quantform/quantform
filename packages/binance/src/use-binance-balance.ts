import { combineLatest, map, Observable } from 'rxjs';

import { AssetSelector, Balance } from '@quantform/core';

import { assetNotSupported, useBinanceAsset } from '@lib/use-binance-asset';
import { useBinanceBalances } from '@lib/use-binance-balances';

export function useBinanceBalance(
  asset: AssetSelector
): Observable<Balance | typeof assetNotSupported> {
  return combineLatest([useBinanceAsset(asset), useBinanceBalances()]).pipe(
    map(([asset, balances]) => {
      if (asset === assetNotSupported) {
        return assetNotSupported;
      }

      return balances[asset.id];
    })
  );
}
