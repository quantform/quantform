import { catchError, map, merge, of, retry, switchMap, throwError } from 'rxjs';

import { useBinanceInstrument } from '@lib/instrument';
import { useBinanceOptions } from '@lib/use-binance-options';
import { d, InstrumentSelector, missed, use } from '@quantform/core';

import { useBinanceOrderbookTickerSocket } from './use-binance-orderbook-ticker-socket';

/**
 * Pipes best ask and best bid in realtime.
 */
export const useBinanceOrderbookTicker = use((instrument: InstrumentSelector) => {
  const { retryDelay } = useBinanceOptions();

  return useBinanceInstrument(instrument).pipe(
    switchMap(it => {
      if (it === missed) {
        return of(missed);
      }

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
            of(missed),
            throwError(() => e)
          )
        ),
        retry({ delay: retryDelay })
      );
    })
  );
});
