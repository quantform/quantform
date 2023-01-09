import { map, Observable, shareReplay } from 'rxjs';

import { Asset, useMemo, withMemo } from '@quantform/core';

import { useBinanceInstruments } from '@lib/use-binance-instruments';

export const useBinanceAssets = withMemo(binanceAssets);

function binanceAssets(): Observable<Record<string, Asset>> {
  const snapshot = useMemo<Record<string, Asset>>(() => ({}), [binanceAssets.name]);

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
      }, snapshot)
    ),
    shareReplay(1)
  );
}
