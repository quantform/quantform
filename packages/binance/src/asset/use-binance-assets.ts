import { map } from 'rxjs';

import { useBinanceInstruments } from '@lib/instrument';
import { Asset, use } from '@quantform/core';

/**
 * @title useAssets
 * @description
 * This function creates a WebSocket connection to the order book server and listens
 * for updates to the order book. Whenever new data is received, the function calls the
 * updateOrderBook function to update the current state of the order book.
 *
 * @example
 * ```
 * const assets = useBinanceAssets()
 * ```
 */
export const useBinanceAssets = use(() => {
  const assets = {} as Record<string, Asset>;

  return useBinanceInstruments().pipe(
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
