import { map, Observable, of, switchMap } from 'rxjs';

import { assetNotSupported, useBinanceAsset } from '@lib/asset';
import { AssetSelector } from '@quantform/core';

import { BinanceBalance, useBinanceBalances } from './use-binance-balances';

export function useBinanceBalance(
  asset: AssetSelector
): Observable<BinanceBalance | typeof assetNotSupported> {
  return useBinanceAsset(asset).pipe(
    switchMap(it =>
      it !== assetNotSupported ? useBinanceBalances() : of(assetNotSupported)
    ),
    map(it => it[asset.id])
  );
}
