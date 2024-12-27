import { map } from 'rxjs';
import { z } from 'zod';

import { useRequest } from '@lib/use-request';
import { Asset, Commission, Instrument, useCache } from '@quantform/core';

export class PerpetualInstrument extends Instrument {
  constructor(
    id: number,
    asset: Asset,
    quoteAsset: Asset,
    name: string,
    commission: Commission,
    readonly maxLeverage: number,
    readonly onlyIsolated: boolean
  ) {
    super(id, asset, quoteAsset, name, commission);
  }
}

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
    useRequest({ patch: '/info', body: { type: 'meta' } }),
    getInstruments.discriminator()
  ).pipe(
    map(({ timestamp, payload }) =>
      responseType
        .parse(payload)
        .universe.map(
          it =>
            new PerpetualInstrument(
              timestamp,
              new Asset(it.name.toLowerCase(), 'hyperliquid', it.szDecimals),
              QuoteAsset,
              it.name,
              Commission.Zero,
              it.maxLeverage,
              it.onlyIsolated
            )
        )
    )
  );
}

getInstruments.discriminator = () => ['hyperliquid', 'perpetual', 'get-instruments'];
