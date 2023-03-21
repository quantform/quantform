import { map } from 'rxjs';
import { z } from 'zod';

import { useReadonlySocket } from '@lib/use-readonly-socket';
import { d, decimal, Instrument, use, useReplay } from '@quantform/core';

const messageType = z.object({
  asks: z.array(z.array(z.string())),
  bids: z.array(z.array(z.string()))
});

export type Level = `${5 | 10 | 20}@${100 | 1000}ms`;

export const useOrderbookDepthSocket = use((instrument: Instrument, level: Level) => {
  const orderbook = {
    timestamp: 0,
    instrument,
    asks: Array.of<{ quantity: decimal; rate: decimal }>(),
    bids: Array.of<{ quantity: decimal; rate: decimal }>(),
    level
  };

  return useReplay(
    useReadonlySocket(messageType, `ws/${instrument.raw.toLowerCase()}@depth${level}`),
    ['orderbook-depth', instrument.id, level]
  ).pipe(
    map(({ timestamp, payload }) => {
      orderbook.timestamp = timestamp;
      orderbook.asks = payload.asks.map(it => ({ rate: d(it[0]), quantity: d(it[1]) }));
      orderbook.bids = payload.bids.map(it => ({ rate: d(it[0]), quantity: d(it[1]) }));

      return orderbook;
    })
  );
});
