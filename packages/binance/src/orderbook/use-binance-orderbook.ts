import { map, Observable, of, switchMap } from 'rxjs';

import {
  d,
  Instrument,
  InstrumentSelector,
  Orderbook,
  useMemo,
  useTimestamp
} from '@quantform/core';

import { instrumentNotSupported, useBinanceInstrument } from '@lib/instrument';

import { useBinanceOrderbookStreamer } from './use-binance-orderbook-streamer';

export function useBinanceOrderbook(
  instrument: InstrumentSelector
): Observable<Orderbook | typeof instrumentNotSupported> {
  return useBinanceInstrument(instrument).pipe(
    switchMap(it => {
      if (it === instrumentNotSupported) {
        return of(instrumentNotSupported);
      }

      return useMemo(
        () => useBinanceOrderbookStreaming(it),
        [useBinanceOrderbook.name, it.id]
      );
    })
  );
}

function useBinanceOrderbookStreaming(instrument: Instrument) {
  const orderbook = new Orderbook(
    0,
    instrument,
    { quantity: d.Zero, rate: d.Zero, next: undefined },
    { quantity: d.Zero, rate: d.Zero, next: undefined }
  );

  return useBinanceOrderbookStreamer(instrument).pipe(
    map(it => {
      const { asks, bids } = mapBinanceToOrderbook(it);

      orderbook.timestamp = useTimestamp();
      orderbook.asks = asks;
      orderbook.bids = bids;

      return orderbook;
    })
  );
}

function mapBinanceToOrderbook(message: any) {
  return {
    asks: { rate: d(message.bestAsk), quantity: d(message.bestAskQty), next: undefined },
    bids: { rate: d(message.bestBid), quantity: d(message.bestBidQty), next: undefined }
  };
}
