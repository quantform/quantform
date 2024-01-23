import { map, switchMap } from 'rxjs';

import { d, InstrumentSelector } from '@quantform/core';

import { whenOrderbookTickerSocket } from './api/when-orderbook-ticker-socket';
import { withInstrument } from './with-instrument';

export function whenOrderbookTicker(instrument: InstrumentSelector) {
  return withInstrument(instrument).pipe(
    switchMap(it => {
      const ticker = {
        timestamp: 0,
        instrument: it,
        asks: { quantity: d.Zero, rate: d.Zero },
        bids: { quantity: d.Zero, rate: d.Zero }
      };

      return whenOrderbookTickerSocket(it.raw.toLowerCase()).pipe(
        map(({ timestamp, payload }) => {
          ticker.timestamp = timestamp;
          ticker.asks = { rate: d(payload.a), quantity: d(payload.A) };
          ticker.bids = { rate: d(payload.b), quantity: d(payload.B) };

          return ticker;
        })
      );
    })
  );
}
