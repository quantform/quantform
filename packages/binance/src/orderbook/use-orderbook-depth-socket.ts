import { map, repeat, retry } from 'rxjs';
import { z } from 'zod';

import { useReadonlySocket } from '@lib/use-readonly-socket';
import { Instrument } from '@quantform/core';

const messageType = z.object({
  lastUpdateId: z.number(),
  asks: z.array(z.array(z.string())),
  bids: z.array(z.array(z.string()))
});

export type Level = `${5 | 10 | 20}@${100 | 1000}ms`;

export const useOrderbookDepthSocket = (instrument: Instrument, level: Level) =>
  useReadonlySocket(`ws/${instrument.raw.toLowerCase()}@depth${level}`).pipe(
    map(({ timestamp, payload }) => ({ timestamp, payload: messageType.parse(payload) })),
    repeat({ delay: 3000 }),
    retry({ delay: 3000 })
  );
