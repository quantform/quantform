import { Observable, Subject, switchMap, tap } from 'rxjs';

import { Instrument, useMemo } from '@quantform/core';

import { useBinanceConnector } from '@lib/use-binance-connector';

export function useBinanceOrderbookStreamer(instrument: Instrument) {
  return useMemo(
    () => withReplay(binanceOrderbookStreamer(instrument)),
    [useBinanceOrderbookStreamer.name, instrument.id]
  );
}

function binanceOrderbookStreamer(instrument: Instrument) {
  return useBinanceConnector().pipe(
    switchMap(it => {
      const message$ = new Subject<any>();

      it.bookTickers(instrument.raw, message => message$.next(message));

      return message$.asObservable();
    })
  );
}

function withReplay<T>(input: Observable<T>): Observable<T> {
  return input;
}
