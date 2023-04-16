import { map, of, switchMap } from 'rxjs';

import { useInstrument } from '@lib/instrument';
import { d, InstrumentSelector, notFound, use } from '@quantform/core';

import { useOrderbookTickerSocket } from './use-orderbook-ticker-socket';

/**
 * Pipes best ask and best bid in realtime.
 */
export const useOrderbookTicker = use((instrument: InstrumentSelector) =>
  useInstrument(instrument).pipe(
    switchMap(it => {
      if (it === notFound) {
        return of(notFound);
      }

      const ticker = {
        timestamp: 0,
        instrument: it,
        asks: { quantity: d.Zero, rate: d.Zero },
        bids: { quantity: d.Zero, rate: d.Zero }
      };

      return useOrderbookTickerSocket(it).pipe(
        map(({ timestamp, payload }) => {
          ticker.timestamp = timestamp;
          ticker.asks = { rate: d(payload.a), quantity: d(payload.A) };
          ticker.bids = { rate: d(payload.b), quantity: d(payload.B) };

          return ticker;
        })
      );
    })
  )
);
