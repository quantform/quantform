import { map } from 'rxjs';

import { useBinanceInstruments } from '@lib/instrument';
import { Asset, use } from '@quantform/core';

/**
 * @title useBinanceAssets
 * @description
 * The useBinanceAssets function is a hook that retrieves a list of assets available on
 * the Binance cryptocurrency exchange. It returns an Observable stream that emits a single
 * Record object containing key-value pairs of assets, where the key is the asset's ID and
 * the value is an instance of the Asset class.
 *
 * To create the list of assets, the function uses the `useBinanceInstruments` hook to retrieve
 * a list of trading instruments on Binance. It then extracts the base and quote assets from
 * each instrument and adds them to the list of assets.
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
