import { z } from 'zod';

import { useReadonlySocket } from '@lib/use-readonly-socket';
import { Instrument, replay } from '@quantform/core';

const messageType = z.object({
  p: z.string(),
  q: z.string(),
  t: z.number(),
  b: z.number(),
  a: z.number(),
  m: z.boolean()
});

export const useTradeSocket = replay((instrument: Instrument) =>
  useReadonlySocket(messageType, `ws/${instrument.raw.toLowerCase()}@trade`)
);
