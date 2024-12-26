import { mergeMap } from 'rxjs';
import { z } from 'zod';

import { d, Instrument, useMemo } from '@quantform/core';

import { useSocketSubscription } from './use-socket-subscription';

const payloadType = z.array(
  z.object({
    coin: z.string(),
    side: z.string(),
    px: z.string(),
    sz: z.string(),
    time: z.number(),
    hash: z.string(),
    tid: z.number(),
    users: z.array(z.string())
  })
);

export function watchTrades(instrument: Instrument) {
  return useMemo(
    () =>
      useSocketSubscription({ type: 'trades', coin: instrument.raw }).pipe(
        mergeMap(({ payload }) =>
          payloadType.parse(payload).map(it => ({
            timestamp: it.time,
            price: d(it.px),
            size: d(it.sz),
            side: it.side,
            hash: it.hash,
            tid: it.tid,
            users: it.users
          }))
        )
      ),
    ['hyperliquid', 'watch-trades', instrument]
  );
}
