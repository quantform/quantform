import { map, Observable } from 'rxjs';

import { Asset, AssetSelector } from '@quantform/core';

import { useBinanceAssets } from '@lib/use-binance-assets';

export const assetNotSupported = Symbol('Asset not supported!');

/**
 * Pipes balance changes filtered by asset selector.
 * @param asset
 * @returns
 */
export function useBinanceAsset(
  asset: AssetSelector
): Observable<Asset | typeof assetNotSupported> {
  return useBinanceAssets().pipe(map(it => it[asset.id] ?? assetNotSupported));
}
