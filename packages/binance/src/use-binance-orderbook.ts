import {
  combineLatest,
  Observable,
  of,
  ReplaySubject,
  shareReplay,
  switchMap
} from 'rxjs';

import { d, InstrumentSelector, Orderbook, useMemo } from '@quantform/core';

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
        const orderbook = new Orderbook(
          0,
          instrument,
          { quantity: d.Zero, rate: d.Zero, next: undefined },
          { quantity: d.Zero, rate: d.Zero, next: undefined }
        );

        connector.bookTickers(instrument.raw, message => {
          const { asks, bids } = mapBinanceToOrderbook(message);

          orderbook.asks = asks;
          orderbook.bids = bids;

          orderbook$.next(orderbook);
        });

        return orderbook$.asObservable().pipe(shareReplay(1));
      }, [useBinanceOrderbook.name, instrument.id]);
    })
  );
}

function mapBinanceToOrderbook(message: any) {
  return {
    asks: { rate: d(message.bestAsk), quantity: d(message.bestAskQty), next: undefined },
    bids: { rate: d(message.bestBid), quantity: d(message.bestBidQty), next: undefined }
  };
}
