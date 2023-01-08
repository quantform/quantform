import { from, shareReplay } from 'rxjs';

import { useProvider, withMemo } from '@quantform/core';

import { BinanceConnector } from '@lib/binance-connector';

export const useBinanceConnector = withMemo(binanceConnector);

function binanceConnector() {
  const connector = useProvider(BinanceConnector);

  return from(
    new Promise<BinanceConnector>(async resolve => {
      await connector.useServerTime();
      resolve(connector);
    })
  ).pipe(shareReplay(1));
}
