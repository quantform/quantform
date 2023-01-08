import {
  combineLatest,
  Observable,
  of,
  ReplaySubject,
  shareReplay,
  switchMap
} from 'rxjs';

import { d, Instrument, InstrumentSelector, Orderbook, useMemo } from '@quantform/core';

import { useBinanceConnector } from '@lib/use-binance-connector';
import {
  instrumentNotSupported,
  useBinanceInstrument
} from '@lib/use-binance-instrument';

export function useBinanceOrderbook(
  instrument: InstrumentSelector
): Observable<Orderbook | typeof instrumentNotSupported> {
  return combineLatest([useBinanceConnector(), useBinanceInstrument(instrument)]).pipe(
    switchMap(([connector, instrument]) => {
      if (instrument === instrumentNotSupported) {
        return of(instrumentNotSupported);
      }

      return useMemo(() => {
        const orderbook$ = new ReplaySubject<Orderbook>();

        connector.bookTickers(instrument.raw, message => {
          orderbook$.next(mapBinanceToOrderbook(message, instrument));
        });

        return orderbook$.asObservable().pipe(shareReplay(1));
      }, [useBinanceOrderbook.name, instrument.id]);
    })
  );
}

function mapBinanceToOrderbook(message: any, instrument: Instrument) {
  return new Orderbook(
    0,
    instrument,
    { rate: d(message.bestAsk), quantity: d(message.bestAskQty), next: undefined },
    { rate: d(message.bestBid), quantity: d(message.bestBidQty), next: undefined }
  );
}
