import { map, switchMap } from 'rxjs';

import { Level, watchOrderbookDepthSocket } from '@lib/api';
import { getInstrument } from '@lib/instrument/get-instrument';
import { d, decimal, InstrumentSelector } from '@quantform/core';

export function watchOrderbookDepth(instrument: InstrumentSelector, level: Level) {
  return getInstrument(instrument).pipe(
    switchMap(it => {
      const orderbook = {
        timestamp: 0,
        instrument,
        asks: Array.of<{ quantity: decimal; rate: decimal }>(),
        bids: Array.of<{ quantity: decimal; rate: decimal }>(),
        level
      };

      return watchOrderbookDepthSocket(it.raw.toLowerCase(), level).pipe(
        map(({ timestamp, payload }) => {
          const { asks, bids } = payload;

          orderbook.timestamp = timestamp;
          orderbook.asks = asks.map(it => ({ rate: d(it[0]), quantity: d(it[1]) }));
          orderbook.bids = bids.map(it => ({ rate: d(it[0]), quantity: d(it[1]) }));

          return orderbook;
        })
      );
    })
  );
}
