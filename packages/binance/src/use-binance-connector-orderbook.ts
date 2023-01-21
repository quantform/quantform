import { shareReplay, Subject, switchMap } from 'rxjs';

import { Instrument, useReplay, useTimestamp } from '@quantform/core';

import { useBinanceConnector } from '@lib/use-binance-connector';

export function useBinanceConnectorOrderbook(instrument: Instrument) {
  return useReplay(
    useBinanceConnector().pipe(
      switchMap(it => {
        const message$ = new Subject<{ timestamp: number; payload: unknown }>();

        it.bookTickers(instrument.raw, payload =>
          message$.next({ timestamp: useTimestamp(), payload })
        );

        return message$.pipe(shareReplay(1));
      })
    ),
    [useBinanceConnectorOrderbook.name, instrument.id]
  );
}
