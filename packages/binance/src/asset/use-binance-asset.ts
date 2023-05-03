import { map } from 'rxjs';

import { AssetSelector, MissingAssetError, withMemo } from '@quantform/core';

import { useBinanceAssets } from './use-binance-assets';

/**
 * @title useBinanceAsset
 * @description
 * The `useBinanceAsset` function is a utility function that returns a stream of a specific
 * asset from Binance assets. It takes in an `AssetSelector` object that represents the
 * desired asset and uses the `useBinanceAssets` hook to retrieve a stream of all Binance
 * assets. The function then maps over the stream to find the asset with the provided ID.
 * If the asset is not found, the function throws a `MissingAssetError` with the original
 * `AssetSelector` object as an argument.
 *
 * @example
 * ```
 * const asset = useBinanceAsset(assetOf('binance:btc-usdt'))
 * ```
 */
export const useBinanceAsset = withMemo((asset: AssetSelector) =>
  useBinanceAssets().pipe(
    map(it => {
      if (!it[asset.id]) {
        throw new MissingAssetError(asset);
      }

      return it[asset.id];
    })
  )
);
