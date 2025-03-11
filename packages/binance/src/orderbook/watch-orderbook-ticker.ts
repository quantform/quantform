import { map, switchMap } from 'rxjs';

import { watchOrderbookTickerSocket } from '@lib/api/when-orderbook-ticker-socket';
import { getInstrument } from '@lib/instrument/get-instrument';
import { d, InstrumentSelector } from '@quantform/core';

export function watchOrderbookTicker(instrument: InstrumentSelector) {
  return getInstrument(instrument).pipe(
    switchMap(it => {
      const ticker = {
        timestamp: 0,
        instrument: it,
        asks: { quantity: d.Zero, rate: d.Zero },
        bids: { quantity: d.Zero, rate: d.Zero }
      };

      return watchOrderbookTickerSocket(it.raw.toLowerCase()).pipe(
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
