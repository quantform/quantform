import { map, shareReplay } from 'rxjs';

import { useInstruments } from '@lib/instrument';
import { asReadonly, Asset, withMemo } from '@quantform/core';

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
export const useAssets = withMemo(() => {
  const assets = {} as Record<string, Asset>;

  return useInstruments().pipe(
    map(it =>
      it
        .flatMap(it => [it.base, it.quote])
        .reduce((assets, it) => {
          assets[it.id] = assets[it.id] ?? new Asset(it.name, it.adapterName, 8);

          return assets;
        }, assets)
    ),
    shareReplay(1),
    asReadonly()
  );
});
