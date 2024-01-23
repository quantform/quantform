import { map } from 'rxjs';

import { Asset, withMemo } from '@quantform/core';

import { withInstruments } from './with-instruments';

/**
 * @title withAssets
 * @description
 * The `withAssets` function is a utility function that retrieves all available assets
 * from Binance and returns them as an Observable. It does this by using the
 * `useBinanceInstruments` hook to retrieve all trading pairs on Binance, and then extracts
 * the base and quote assets from each pair. The function then reduces these assets into a
 * single object that maps each asset's ID to an `Asset` object.
 *
 * @example
 * ```
 * const assets = withAssets()
 * ```
 */
export const withAssets = withMemo(() => {
  const assets = {} as Record<string, Asset>;

  return withInstruments().pipe(
    map(it =>
      it
        .flatMap(it => [it.base, it.quote])
        .reduce((assets, it) => {
          assets[it.id] = assets[it.id] ?? new Asset(it.name, it.adapterName, 8);

          return assets;
        }, assets)
    )
  );
});
