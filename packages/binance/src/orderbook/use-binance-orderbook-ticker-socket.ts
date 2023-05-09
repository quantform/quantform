import { map } from 'rxjs';
import { z } from 'zod';

import { whenSocket } from '@lib/when-socket';
import { Instrument } from '@quantform/core';

const messageType = z.object({
  a: z.string(),
  A: z.string(),
  b: z.string(),
  B: z.string()
});

export const useBinanceOrderbookTickerSocket = (instrument: Instrument) =>
  whenSocket(`ws/${instrument.raw.toLowerCase()}@bookTicker`).pipe(
    map(({ timestamp, payload }) => ({ timestamp, payload: messageType.parse(payload) }))
  );
