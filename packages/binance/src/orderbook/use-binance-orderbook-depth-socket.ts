import { map, shareReplay } from 'rxjs';

import { useBinanceSocket } from '@lib/use-binance-socket';
import { d, decimal, Instrument, useReplay } from '@quantform/core';

export type Level = `${5 | 10 | 20}@${100 | 1000}ms`;

export function useBinanceOrderbookDepthSocket(instrument: Instrument, level: Level) {
  const orderbook = {
    timestamp: 0,
    instrument,
    asks: Array.of<{ quantity: decimal; rate: decimal }>(),
    bids: Array.of<{ quantity: decimal; rate: decimal }>(),
    level
  };

  return useReplay(useBinanceSocket(`ws/${instrument.raw.toLowerCase()}@depth${level}`), [
    useBinanceOrderbookDepthSocket.name,
    instrument.id,
    level
  ]).pipe(
    map(({ timestamp, payload }) => {
      const { asks, bids } = mapBinanceToOrderbook(payload);

      orderbook.timestamp = timestamp;
      orderbook.asks = asks;
      orderbook.bids = bids;

      return orderbook;
    }),
    shareReplay(1)
  );
}

function mapBinanceToOrderbook(message: any) {
  return {
    asks: message.asks.map(it => ({ rate: d(it[0]), quantity: d(it[1]) })),
    bids: message.bids.map(it => ({ rate: d(it[0]), quantity: d(it[1]) }))
  };
}
