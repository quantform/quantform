import { map } from 'rxjs';
import { z } from 'zod';

import { useBinanceSocket } from '@lib/use-binance-socket';
import { Instrument } from '@quantform/core';

const messageType = z.object({
  p: z.string(),
  q: z.string(),
  t: z.number(),
  b: z.number(),
  a: z.number(),
  m: z.boolean()
});

export const useBinanceTradeSocket = (instrument: Instrument) =>
  useBinanceSocket(`ws/${instrument.raw.toLowerCase()}@trade`).pipe(
    map(({ timestamp, payload }) => ({ timestamp, payload: messageType.parse(payload) }))
  );
