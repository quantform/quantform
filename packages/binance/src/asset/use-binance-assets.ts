import { map, Observable, shareReplay } from 'rxjs';

import { useBinanceInstruments } from '@lib/instrument';
import { Asset, useMemo, useState } from '@quantform/core';

export function useBinanceAssets() {
  return useMemo(() => binanceAssets(), [useBinanceAssets.name]);
}

function binanceAssets(): Observable<Record<string, Asset>> {
  const assets = {} as Record<string, Asset>;

  return useBinanceInstruments().pipe(
    map(it =>
      it.reduce((snapshot, it) => {
        snapshot[it.base.id] =
          snapshot[it.base.id] ??
          new Asset(it.base.name, it.base.adapterName, it.base.scale);

        snapshot[it.quote.id] =
          snapshot[it.quote.id] ??
          new Asset(it.quote.name, it.quote.adapterName, it.quote.scale);

        return snapshot;
      }, assets)
    ),
    shareReplay(1)
  );
}
