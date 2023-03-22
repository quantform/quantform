import { map, Observable } from 'rxjs';

import { Asset, assetNotSupported, AssetSelector, use } from '@quantform/core';

import { useAssets } from './use-assets';

/**
 * @title useBinanceAsset
 * @description
 * This function creates a WebSocket connection to the order book server and listens
 * for updates to the order book. Whenever new data is received, the function calls the
 * updateOrderBook function to update the current state of the order book.
 *
 * @example
 * ```
 * const asset = useBinanceAsset(assetOf('binance:btc-usdt'))
 * ```
 */
export const useAsset = use(
  (asset: AssetSelector): Observable<Readonly<Asset> | typeof assetNotSupported> =>
    useAssets().pipe(map(it => it[asset.id] ?? assetNotSupported))
);
