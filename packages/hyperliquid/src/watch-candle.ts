import { map } from 'rxjs';
import { z } from 'zod';

import { Instrument, useMemo, useReplay } from '@quantform/core';

import { useSocketSubscription } from './use-socket-subscription';

const payloadType = z.array(
  z.object({
    t: z.number(),
    T: z.number(),
    s: z.string(),
    i: z.string(),
    o: z.number(),
    c: z.number(),
    h: z.number(),
    l: z.number(),
    v: z.number(),
    n: z.number()
  })
);

export function watchCandle(instrument: Instrument, interval: string) {
  const key = hash(instrument, interval);

  return useMemo(
    () =>
      useReplay(
        useSocketSubscription({ type: 'candle', coin: instrument.raw, interval }),
        key
      ).pipe(
        map(it =>
          payloadType.parse(it.payload).map(it => ({
            timestamp: it.t,
            open: it.o,
            high: it.h,
            low: it.l,
            close: it.c,
            volume: it.v,
            trades: it.n
          }))
        )
      ),
    key
  );
}

export function hash(instrument: Instrument, interval: string) {
  return ['hyperliquid', 'watch-candle', instrument, interval];
}
