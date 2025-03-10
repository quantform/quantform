import { map } from 'rxjs';
import { z } from 'zod';

import { useReplay } from '@quantform/core';

import { whenSocket } from './when-socket';

const messageType = z.object({
  p: z.string(),
  q: z.string(),
  t: z.number(),
  m: z.boolean()
});

watchTradeSocket.forSymbol = (symbol: string) => ['binance', 'trade', symbol];

export function watchTradeSocket(symbol: string) {
  return useReplay(
    whenSocket(`ws/${symbol.toLowerCase()}@trade`).pipe(
      map(({ timestamp, payload }) => ({
        timestamp,
        payload: messageType.parse(payload)
      }))
    ),
    watchTradeSocket.forSymbol(symbol)
  );
}
