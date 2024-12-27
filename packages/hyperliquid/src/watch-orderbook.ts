import { map } from 'rxjs';
import { z } from 'zod';

import { d, Instrument, useMemo, useReplay } from '@quantform/core';

import { useSocketSubscription } from './use-socket-subscription';

const payloadType = z.object({
  coin: z.string(),
  time: z.number(),
  levels: z.array(z.array(z.object({ px: z.string(), sz: z.string(), n: z.number() })))
});

export function watchOrderbook(instrument: Instrument) {
  const key = discriminator(instrument);

  return useMemo(
    () =>
      useReplay(
        useSocketSubscription({ type: 'l2Book', coin: instrument.raw }),
        key
      ).pipe(
        map(({ payload }) => {
          const { time, levels } = payloadType.parse(payload);

          return {
            timestamp: time,
            instrument,
            bids: levels[0].map(it => ({
              price: d(it.px),
              size: d(it.sz),
              count: it.n
            })),
            asks: levels[1].map(it => ({
              price: d(it.px),
              size: d(it.sz),
              count: it.n
            }))
          };
        })
      ),
    key
  );
}

export function discriminator(instrument: Instrument) {
  return ['hyperliquid', 'watch-orderbook', instrument];
}
