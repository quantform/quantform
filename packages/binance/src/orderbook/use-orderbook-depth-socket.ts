import { map } from 'rxjs';
import { z } from 'zod';

import { useReadonlySocket } from '@lib/use-readonly-socket';
import { d, decimal, Instrument, useReplay } from '@quantform/core';

export type Level = `${5 | 10 | 20}@${100 | 1000}ms`;

export function useOrderbookDepthSocket(instrument: Instrument, level: Level) {
  const orderbook = {
    timestamp: 0,
    instrument,
    asks: Array.of<{ quantity: decimal; rate: decimal }>(),
    bids: Array.of<{ quantity: decimal; rate: decimal }>(),
    level
  };

  return useReplay(
    useReadonlySocket(z.any(), `ws/${instrument.raw.toLowerCase()}@depth${level}`),
    [useOrderbookDepthSocket.name, instrument.id, level]
  ).pipe(
    map(({ timestamp, payload }) => {
      const { asks, bids } = mapBinanceToOrderbook(payload);

      orderbook.timestamp = timestamp;
      orderbook.asks = asks;
      orderbook.bids = bids;

      return orderbook;
    })
  );
}

function mapBinanceToOrderbook(message: any) {
  return {
    asks: message.asks.map(it => ({ rate: d(it[0]), quantity: d(it[1]) })),
    bids: message.bids.map(it => ({ rate: d(it[0]), quantity: d(it[1]) }))
  };
}
