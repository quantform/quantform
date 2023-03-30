import { z } from 'zod';

import { useReadonlySocket } from '@lib/use-readonly-socket';
import { Instrument, replay } from '@quantform/core';

const messageType = z.object({
  a: z.string(),
  A: z.string(),
  b: z.string(),
  B: z.string()
});

export const useOrderbookTickerSocket = replay((instrument: Instrument) =>
  useReadonlySocket(messageType, `ws/${instrument.raw.toLowerCase()}@bookTicker`)
);
