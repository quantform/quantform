import { catchError, map, merge, of, retry, switchMap, throwError } from 'rxjs';

import { withInstrument } from '@lib/instrument';
import { useOptions } from '@lib/use-options';
import { d, decimal, errored, InstrumentSelector, withMemo } from '@quantform/core';

import {
  Level,
  useBinanceOrderbookDepthSocket
} from './use-binance-orderbook-depth-socket';

/**
 * Pipes best ask and best bid in realtime.
 */
export const whenOrderbookDepth = withMemo(
  (instrument: InstrumentSelector, level: Level) => {
    const { retryDelay } = useOptions();

    return withInstrument(instrument).pipe(
      switchMap(it => {
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
          catchError(e =>
            merge(
              of(errored),
              throwError(() => e)
            )
          )
        );
      }),
      retry({ delay: retryDelay })
    );
  }
);