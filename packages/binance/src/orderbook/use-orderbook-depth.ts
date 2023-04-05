import { map, of, switchMap } from 'rxjs';

import { useInstrument } from '@lib/instrument';
import { d, decimal, InstrumentSelector, notFound, use } from '@quantform/core';

import { Level, useOrderbookDepthSocket } from './use-orderbook-depth-socket';

/**
 * Pipes best ask and best bid in realtime.
 */
export const useOrderbookDepth = use((instrument: InstrumentSelector, level: Level) =>
  useInstrument(instrument).pipe(
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

      return useOrderbookDepthSocket(it, level).pipe(
        map(({ timestamp, payload }) => {
          const { asks, bids } = payload;

          orderbook.timestamp = timestamp;
          orderbook.asks = asks.map(it => ({ rate: d(it[0]), quantity: d(it[1]) }));
          orderbook.bids = bids.map(it => ({ rate: d(it[0]), quantity: d(it[1]) }));

          return orderbook;
        })
      );
    })
  )
);
