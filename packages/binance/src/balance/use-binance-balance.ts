import { map, Observable, of, switchMap } from 'rxjs';

import { AssetSelector } from '@quantform/core';

import { assetNotSupported, useBinanceAsset } from '@lib/asset';

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
