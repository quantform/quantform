import { map, switchMap } from 'rxjs';

import { Level, whenOrderbookDepthSocket } from '@lib/api';
import { d, decimal, InstrumentSelector } from '@quantform/core';

import { withInstrument } from './with-instrument';

export function whenOrderbookDepth(instrument: InstrumentSelector, level: Level) {
  return withInstrument(instrument).pipe(
    switchMap(it => {
      const orderbook = {
        timestamp: 0,
        instrument,
        asks: Array.of<{ quantity: decimal; rate: decimal }>(),
        bids: Array.of<{ quantity: decimal; rate: decimal }>(),
        level
      };

      return whenOrderbookDepthSocket(it.raw.toLowerCase(), level).pipe(
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
