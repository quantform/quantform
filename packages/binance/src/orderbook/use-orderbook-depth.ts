import { map, of, switchMap } from 'rxjs';

import { useInstrument } from '@lib/instrument';
import {
  connected,
  d,
  decimal,
  disconnected,
  exclude,
  instrumentNotSupported,
  InstrumentSelector,
  use
} from '@quantform/core';

import { Level, useOrderbookDepthSocket } from './use-orderbook-depth-socket';

/**
 * Pipes best ask and best bid in realtime.
 */
export const useOrderbookDepth = use((instrument: InstrumentSelector, level: Level) =>
  useInstrument(instrument).pipe(
    switchMap(it => {
      if (it === instrumentNotSupported) {
        return of(instrumentNotSupported);
      }

      const orderbook = {
        timestamp: 0,
        instrument,
        asks: Array.of<{ quantity: decimal; rate: decimal }>(),
        bids: Array.of<{ quantity: decimal; rate: decimal }>(),
        level
      };

      return useOrderbookDepthSocket(it, level).pipe(
        exclude(connected),
        map(it => {
          if (it === disconnected) {
            orderbook.timestamp = 0;
            orderbook.asks = [];
            orderbook.bids = [];

            return orderbook;
          }

          const { asks, bids } = it.payload;

          orderbook.timestamp = it.timestamp;
          orderbook.asks = asks.map(it => ({ rate: d(it[0]), quantity: d(it[1]) }));
          orderbook.bids = bids.map(it => ({ rate: d(it[0]), quantity: d(it[1]) }));

          return orderbook;
        })
      );
    })
  )
);
