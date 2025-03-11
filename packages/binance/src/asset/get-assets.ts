import { map } from 'rxjs';

import { getInstruments } from '@lib/instrument/get-instruments';
import { Asset, withMemo } from '@quantform/core';

export const getAssets = withMemo(() => {
  const assets = {} as Record<string, Asset>;

  return getInstruments().pipe(
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
