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
  useReadonlySocket(messageType, `ws/${instrument.raw.toLowerCase()}@bookTicker`);
