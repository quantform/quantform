import { map } from 'rxjs';
import { z } from 'zod';

import { d, Instrument, useMemo } from '@quantform/core';

import { useSocketSubscription } from './use-socket-subscription';

const payloadType = z.object({
  coin: z.string(),
  time: z.number(),
  levels: z.array(z.array(z.object({ px: z.string(), sz: z.string(), n: z.number() })))
});

export function watchOrderbook(instrument: Instrument) {
  return useMemo(
    () =>
      useSocketSubscription({ type: 'l2Book', coin: instrument.raw }).pipe(
        map(({ payload }) => {
          const message = payloadType.parse(payload);

          return {
            timestamp: message.time,
            bids: message.levels[0].map(it => ({
              price: d(it.px),
              size: d(it.sz),
              count: it.n
            })),
            asks: message.levels[1].map(it => ({
              price: d(it.px),
              size: d(it.sz),
              count: it.n
            }))
          };
        })
      ),
    ['hyperliquid', 'watch-orderbook', instrument]
  );
}
