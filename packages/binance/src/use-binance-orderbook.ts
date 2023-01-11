import { map, Observable, of, switchMap } from 'rxjs';

import { d, InstrumentSelector, Orderbook, useMemo, useTimestamp } from '@quantform/core';

import {
  instrumentNotSupported,
  useBinanceInstrument
} from '@lib/use-binance-instrument';
import { useBinanceOrderbookStreamer } from '@lib/use-binance-orderbook-streamer';

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
        [useBinanceOrderbook.name, instrument.id]
      );

      return useBinanceOrderbookStreamer(it).pipe(
        map(it => {
          const { asks, bids } = mapBinanceToOrderbook(it);

          orderbook.timestamp = useTimestamp();
          orderbook.asks = asks;
          orderbook.bids = bids;

          return orderbook;
        })
      );
    })
  );
}

function mapBinanceToOrderbook(message: any) {
  return {
    asks: { rate: d(message.bestAsk), quantity: d(message.bestAskQty), next: undefined },
    bids: { rate: d(message.bestBid), quantity: d(message.bestBidQty), next: undefined }
  };
}
