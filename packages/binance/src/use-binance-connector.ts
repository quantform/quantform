import { from, shareReplay } from 'rxjs';

import { useMemo, useProvider } from '@quantform/core';

import { BinanceConnector } from '@lib/binance-connector';

export function useBinanceConnector() {
  return useMemo(() => {
    const connector = useProvider(BinanceConnector);

    return from(
      new Promise<BinanceConnector>(async resolve => {
        await connector.useServerTime();
        resolve(connector);
      })
    ).pipe(shareReplay(1));
  }, [useBinanceConnector.name]);
}
