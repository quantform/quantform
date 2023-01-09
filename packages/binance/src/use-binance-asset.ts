import { map, Observable } from 'rxjs';

import { Asset, AssetSelector } from '@quantform/core';

import { useBinanceAssets } from '@lib/use-binance-assets';

export const assetNotSupported = Symbol('Asset not supported!');

export function useBinanceAsset(
  asset: AssetSelector
): Observable<Asset | typeof assetNotSupported> {
  return useBinanceAssets().pipe(map(it => it[asset.id] ?? assetNotSupported));
}
