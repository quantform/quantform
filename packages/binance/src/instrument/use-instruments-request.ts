import { map } from 'rxjs';
import { z } from 'zod';

import { usePublicRequest } from '@lib/use-public-request';
import { useCache } from '@quantform/core';

const responseType = z.object({
  symbols: z.array(
    z.object({
      symbol: z.string(),
      baseAsset: z.string(),
      quoteAsset: z.string(),
      filters: z.array(z.any())
    })
  )
});

export const useInstrumentsRequest = () =>
  useCache(
    usePublicRequest({
      method: 'GET',
      patch: '/api/v3/exchangeInfo',
      query: {}
    }),
    ['/api/v3/exchangeInfo']
  ).pipe(
    map(({ timestamp, payload }) => ({
      timestamp,
      payload: responseType.parse(payload)
    }))
  );
