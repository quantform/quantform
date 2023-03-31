import { map, of, switchMap } from 'rxjs';

import { useInstrument } from '@lib/instrument';
import {
  connected,
  d,
  disconnected,
  exclude,
  instrumentNotSupported,
  InstrumentSelector,
  use
} from '@quantform/core';

import { useOrderbookTickerSocket } from './use-orderbook-ticker-socket';

/**
 * Pipes best ask and best bid in realtime.
 */
export const useOrderbookTicker = use((instrument: InstrumentSelector) =>
  useInstrument(instrument).pipe(
    switchMap(it => {
      if (it === instrumentNotSupported) {
        return of(instrumentNotSupported);
      }

      const ticker = {
        timestamp: 0,
        instrument: it,
        asks: { quantity: d.Zero, rate: d.Zero },
        bids: { quantity: d.Zero, rate: d.Zero }
      };

      return useOrderbookTickerSocket(it).pipe(
        exclude(connected),
        map(it => {
          if (it === disconnected) {
            ticker.timestamp = 0;
            ticker.asks.rate = d.Zero;
            ticker.asks.quantity = d.Zero;
            ticker.bids.rate = d.Zero;
            ticker.bids.quantity = d.Zero;

            return ticker;
          }

          ticker.timestamp = it.timestamp;
          ticker.asks = { rate: d(it.payload.a), quantity: d(it.payload.A) };
          ticker.bids = { rate: d(it.payload.b), quantity: d(it.payload.B) };

          return ticker;
        })
      );
    })
  )
);
