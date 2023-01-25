import { Subject, switchMap } from 'rxjs';

import { useBinanceConnector } from '@lib/use-binance-connector';
import { Instrument, useTimestamp } from '@quantform/core';

export function useBinanceConnectorTrade(instrument: Instrument) {
  return useBinanceConnector().pipe(
    switchMap(it => {
      const message$ = new Subject<{ timestamp: number; payload: unknown }>();

      it.trades(instrument.raw, payload =>
        message$.next({
          timestamp: useTimestamp(),
          payload
        })
      );

      return message$.asObservable();
    })
  );
}
