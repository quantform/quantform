import { map } from 'rxjs';
import { z } from 'zod';

import { d, Instrument, useMemo } from '@quantform/core';

import { useSocketSubscription } from './use-socket-subscription';

const payloadType = z.object({
  coin: z.string(),
  time: z.number(),
  levels: z.array(z.array(z.object({ px: z.string(), sz: z.string(), n: z.number() })))
});

export function watchUsers() {
  return useMemo(
    () => useSocketSubscription({ type: 'userEvents' }).pipe(),
    ['hyperliquid', 'watch-users']
  );
}
