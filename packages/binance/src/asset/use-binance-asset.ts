import { map, Observable } from 'rxjs';

import { Asset, AssetSelector, missed, use } from '@quantform/core';

import { useBinanceAssets } from './use-binance-assets';

/**
 * @title useBinanceAsset
 * @description
 * The useBinanceAsset function is a React Hook that retrieves a specific asset from the
 * list of assets available on the Binance cryptocurrency exchange. It takes an asset selector
 * object as input, which is used to identify the asset to be retrieved.
 *
 * The function returns an Observable stream that emits either a readonly Asset object
 * representing the specified asset or a value of "missed" if the asset cannot be found.
 *
 * To retrieve the asset, the function uses the useBinanceAssets hook to obtain the list
 * of available assets on Binance. It then uses the RxJS map operator to transform the
 * list into a single Asset object that corresponds to the specified asset selector.
 *
 * @example
 * ```
 * const asset = useBinanceAsset(assetOf('binance:btc-usdt'))
 * ```
 */
export const useBinanceAsset = use(
  (asset: AssetSelector): Observable<Readonly<Asset> | typeof missed> =>
    useBinanceAssets().pipe(map(it => it[asset.id] ?? missed))
);
