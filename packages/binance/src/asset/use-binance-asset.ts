import { map, Observable } from 'rxjs';

import { Asset, AssetSelector, missed, use } from '@quantform/core';

import { useBinanceAssets } from './use-binance-assets';

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
export const useBinanceAsset = use(
  (asset: AssetSelector): Observable<Readonly<Asset> | typeof missed> =>
    useBinanceAssets().pipe(map(it => it[asset.id] ?? missed))
);
