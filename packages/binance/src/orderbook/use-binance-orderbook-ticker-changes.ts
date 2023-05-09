import { catchError, map, merge, of, retry, switchMap, throwError } from 'rxjs';

import { withInstrument } from '@lib/instrument';
import { useOptions } from '@lib/use-options';
import { d, errored, InstrumentSelector, withMemo } from '@quantform/core';

import { useBinanceOrderbookTickerSocket } from './use-binance-orderbook-ticker-socket';

/**
 * Pipes best ask and best bid in realtime.
 */
export const useBinanceOrderbookTickerChanges = withMemo(
  (instrument: InstrumentSelector) => {
    const { retryDelay } = useOptions();

    return withInstrument(instrument).pipe(
      switchMap(it => {
        const ticker = {
          timestamp: 0,
          instrument: it,
          asks: { quantity: d.Zero, rate: d.Zero },
          bids: { quantity: d.Zero, rate: d.Zero }
        };

        return useBinanceOrderbookTickerSocket(it).pipe(
          map(({ timestamp, payload }) => {
            ticker.timestamp = timestamp;
            ticker.asks = { rate: d(payload.a), quantity: d(payload.A) };
            ticker.bids = { rate: d(payload.b), quantity: d(payload.B) };

            return ticker;
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
