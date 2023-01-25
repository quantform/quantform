import { from, shareReplay } from 'rxjs';

import { BinanceConnector } from '@lib/binance-connector';
import { useMemo, useProvider } from '@quantform/core';

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
