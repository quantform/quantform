import { map, shareReplay } from 'rxjs';

import { useBinanceInstruments } from '@lib/instrument';
import { asReadonly, Asset, withMemo } from '@quantform/core';

/**
 *
 */
export const useBinanceAssets = withMemo(() => {
  const assets = {} as Record<string, Asset>;

  return useBinanceInstruments().pipe(
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
