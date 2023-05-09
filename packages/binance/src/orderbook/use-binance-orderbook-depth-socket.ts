import { map } from 'rxjs';
import { z } from 'zod';

import { whenSocket } from '@lib/when-socket';
import { Instrument } from '@quantform/core';

const messageType = z.object({
  lastUpdateId: z.number(),
  asks: z.array(z.array(z.string())),
  bids: z.array(z.array(z.string()))
});

export type Level = `${5 | 10 | 20}@${100 | 1000}ms`;

export const useBinanceOrderbookDepthSocket = (instrument: Instrument, level: Level) =>
  whenSocket(`ws/${instrument.raw.toLowerCase()}@depth${level}`).pipe(
    map(({ timestamp, payload }) => ({ timestamp, payload: messageType.parse(payload) }))
  );
