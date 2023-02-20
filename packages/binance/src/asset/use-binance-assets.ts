import { map, shareReplay } from 'rxjs';

import { useBinanceInstruments } from '@lib/instrument';
import { Asset, useMemo } from '@quantform/core';

/**
 *
 */
export function useBinanceAssets() {
  return useMemo(() => {
    const assets = {} as Record<string, Asset>;

    return useBinanceInstruments().pipe(
      map(it =>
        it.reduce((assets, it) => {
          assets[it.base.id] =
            assets[it.base.id] ??
            new Asset(it.base.name, it.base.adapterName, it.base.scale);

          assets[it.quote.id] =
            assets[it.quote.id] ??
            new Asset(it.quote.name, it.quote.adapterName, it.quote.scale);

          return assets;
        }, assets)
      ),
      shareReplay(1)
    );
  }, [useBinanceAssets.name]);
}
