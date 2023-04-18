import { map, of, retry, switchMap } from 'rxjs';

import { useBinanceInstrument } from '@lib/instrument';
import { d, decimal, InstrumentSelector, notFound, use } from '@quantform/core';

import {
  Level,
  useBinanceOrderbookDepthSocket
} from './use-binance-orderbook-depth-socket';

/**
 * Pipes best ask and best bid in realtime.
 */
export const useBinanceOrderbookDepth = use(
  (instrument: InstrumentSelector, level: Level) =>
    useBinanceInstrument(instrument).pipe(
      switchMap(it => {
        if (it === notFound) {
          return of(notFound);
        }

        const orderbook = {
          timestamp: 0,
          instrument,
          asks: Array.of<{ quantity: decimal; rate: decimal }>(),
          bids: Array.of<{ quantity: decimal; rate: decimal }>(),
          level
        };

        return useBinanceOrderbookDepthSocket(it, level).pipe(
          map(({ timestamp, payload }) => {
            const { asks, bids } = payload;

            orderbook.timestamp = timestamp;
            orderbook.asks = asks.map(it => ({ rate: d(it[0]), quantity: d(it[1]) }));
            orderbook.bids = bids.map(it => ({ rate: d(it[0]), quantity: d(it[1]) }));

            return orderbook;
          }),
          retry({ delay: 3000 })
        );
      })
    )
);
