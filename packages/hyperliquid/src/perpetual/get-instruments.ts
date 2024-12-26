import { map } from 'rxjs';
import { z } from 'zod';

import { useRequest } from '@lib/use-request';
import { Asset, Commission, Instrument, useCache } from '@quantform/core';

export class PerpetualInstrument extends Instrument {}

export const QuoteAsset = new Asset('USDC', 'hyperliquid', 2);

export const responseType = z.object({
  universe: z.array(
    z.object({
      szDecimals: z.number(),
      name: z.string(),
      maxLeverage: z.number(),
      onlyIsolated: z.boolean().default(false)
    })
  )
});

export function getInstruments() {
  return useCache(
    useRequest({
      patch: '/info',
      body: { type: 'meta' }
    }),
    ['hyperliquid', 'perpetual', 'get-instruments']
  ).pipe(
    map(it =>
      responseType
        .parse(it.payload)
        .universe.map(
          it =>
            new PerpetualInstrument(
              0,
              new Asset(it.name.toLowerCase(), 'hyperliquid', it.szDecimals),
              QuoteAsset,
              it.name,
              Commission.Zero
            )
        )
    )
  );
}
