import { map, switchMap } from 'rxjs';

import { withInstrument } from '@lib/instrument';
import { whenSimulator } from '@lib/simulator';
import { d, decimal, InstrumentSelector, withMemo } from '@quantform/core';

import {
  Level,
  useBinanceOrderbookDepthSocket
} from './use-binance-orderbook-depth-socket';

function whenBinanceOrderbookDepth(instrument: InstrumentSelector, level: Level) {
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
        })
      );
    })
  );
}

export type whenOrderbookDepthType = typeof whenBinanceOrderbookDepth;

/**
 * Pipes best ask and best bid in realtime.
 */
export const whenOrderbookDepth = withMemo(
  (...args: Parameters<whenOrderbookDepthType>) =>
    whenSimulator(whenBinanceOrderbookDepth, 'when-orderbook-depth', args)
);
