import { map, Observable, of, switchMap } from 'rxjs';

import { AssetSelector, Balance } from '@quantform/core';

import { assetNotSupported, useBinanceAsset } from '@lib/use-binance-asset';
import { useBinanceBalances } from '@lib/use-binance-balances';

export function useBinanceBalance(
  asset: AssetSelector
): Observable<Balance | typeof assetNotSupported> {
  return useBinanceAsset(asset).pipe(
    switchMap(it =>
      it !== assetNotSupported ? useBinanceBalances() : of(assetNotSupported)
    ),
    map(it => it[asset.id])
  );
}
