import { map, repeat, retry } from 'rxjs';
import { z } from 'zod';

import { useReadonlySocket } from '@lib/use-readonly-socket';
import { Instrument } from '@quantform/core';

const messageType = z.object({
  a: z.string(),
  A: z.string(),
  b: z.string(),
  B: z.string()
});

export const useOrderbookTickerSocket = (instrument: Instrument) =>
  useReadonlySocket(`ws/${instrument.raw.toLowerCase()}@bookTicker`).pipe(
    map(({ timestamp, payload }) => ({ timestamp, payload: messageType.parse(payload) })),
    repeat({ delay: 3000 }),
    retry({ delay: 3000 })
  );
