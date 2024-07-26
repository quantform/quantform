import { map } from 'rxjs';
import { z } from 'zod';

import { replay } from '@quantform/core';

import { whenSocket } from './when-socket';

const messageType = z.object({
  p: z.string(),
  q: z.string(),
  t: z.number(),
  m: z.boolean()
});

export const whenTradeSocket = replay(
  (symbol: string) =>
    whenSocket(`ws/${symbol.toLowerCase()}@trade`).pipe(
      map(({ timestamp, payload }) => ({
        timestamp,
        payload: messageType.parse(payload)
      }))
    ),
  ['binance', 'trade']
);
