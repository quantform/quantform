import { map } from 'rxjs';
import { z } from 'zod';

import { whenSocket } from '@lib/when-socket';
import { Instrument, replay } from '@quantform/core';

const messageType = z.object({
  p: z.string(),
  q: z.string(),
  t: z.number(),
  b: z.number(),
  a: z.number(),
  m: z.boolean()
});

export const useBinanceTradeSocket = replay(
  (instrument: Instrument) =>
    whenSocket(`ws/${instrument.raw.toLowerCase()}@trade`).pipe(
      map(({ timestamp, payload }) => ({
        timestamp,
        payload: messageType.parse(payload)
      }))
    ),
  ['binance', 'useBinanceTradeSocket']
);
