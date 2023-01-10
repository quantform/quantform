import { combineLatest, map, Observable, of, Subject, switchMap } from 'rxjs';

import {
  d,
  Instrument,
  instrumentOf,
  InstrumentSelector,
  Orderbook,
  useMemo,
  useTimestamp
} from '@quantform/core';

import { useBinanceConnector } from '@lib/use-binance-connector';
import {
  instrumentNotSupported,
  useBinanceInstrument
} from '@lib/use-binance-instrument';

export function useBinanceOrderbook(
  instrument: InstrumentSelector
): Observable<Orderbook | typeof instrumentNotSupported> {
  return useBinanceInstrument(instrument).pipe(
    switchMap(it => {
      if (it === instrumentNotSupported) {
        return of(instrumentNotSupported);
      }

      const orderbook = useMemo(
        () =>
          new Orderbook(
            0,
            it,
            { quantity: d.Zero, rate: d.Zero, next: undefined },
            { quantity: d.Zero, rate: d.Zero, next: undefined }
          ),
        [useBinanceOrderbook.name, instrument.id, 'orderbook']
      );

      return useMemo(
        () =>
          useBinanceOrderbookStream(it).pipe(
            map(it => {
              const { asks, bids } = mapBinanceToOrderbook(it);

              orderbook.timestamp = useTimestamp();
              orderbook.asks = asks;
              orderbook.bids = bids;

              return orderbook;
            })
          ),
        [useBinanceOrderbook.name, instrument.id, 'stream']
      );
    })
  );
}

function useBinanceOrderbookStream(instrument: Instrument) {
  return useBinanceConnector().pipe(
    switchMap(it => {
      const message$ = new Subject<any>();

      it.bookTickers(instrument.raw, message => message$.next(message));

      return message$.asObservable();
    })
  );
}

function mapBinanceToOrderbook(message: any) {
  return {
    asks: { rate: d(message.bestAsk), quantity: d(message.bestAskQty), next: undefined },
    bids: { rate: d(message.bestBid), quantity: d(message.bestBidQty), next: undefined }
  };
}

export default function () {
  return combineLatest([
    useBinanceOrderbook(instrumentOf('btc-usdt')),
    useBinanceOrderbook(instrumentOf('btc-usdt'))
  ]).pipe(map(([btc, eth]) => btc));
}
