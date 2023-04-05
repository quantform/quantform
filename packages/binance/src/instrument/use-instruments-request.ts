import { z } from 'zod';

import { usePublicRequest } from '@lib/use-public-request';
import { useCache } from '@quantform/core';

const contract = z.object({
  symbols: z.array(
    z.object({
      symbol: z.string(),
      baseAsset: z.string(),
      quoteAsset: z.string(),
      filters: z.array(
        z.discriminatedUnion('filterType', [
          z.object({
            filterType: z.literal('PRICE_FILTER'),
            tickSize: z.string()
          }),
          z.object({
            filterType: z.literal('LOT_SIZE'),
            stepSize: z.string()
          })
        ])
      )
    })
  )
});

export const useInstrumentsRequest = () =>
  useCache(
    usePublicRequest(contract, {
      method: 'GET',
      patch: '/api/v3/exchangeInfo',
      query: {}
    }),
    ['/api/v3/exchangeInfo']
  );
