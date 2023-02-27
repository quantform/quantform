import { map, Observable } from 'rxjs';

import { asReadonly, Asset, AssetSelector } from '@quantform/core';

import { useBinanceAssets } from './use-binance-assets';

export const assetNotSupported = Symbol('Asset not supported!');

/**
 * Pipes balance changes filtered by asset selector.
 * @param asset - test
 * @returns
 */
export function useBinanceAsset(
  asset: AssetSelector
): Observable<Readonly<Asset> | typeof assetNotSupported> {
  return useBinanceAssets().pipe(
    map(it => it[asset.id] ?? assetNotSupported),
    asReadonly()
  );
}
