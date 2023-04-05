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
      filters: z.array(
        z.discriminatedUnion('filterType', [
          z.object({
            filterType: z.literal('PRICE_FILTER'),
            tickSize: z.string()
          }),
          z.object({ filterType: z.literal('PERCENT_PRICE') }),
          z.object({
            filterType: z.literal('LOT_SIZE'),
            stepSize: z.string()
          }),
          z.object({ filterType: z.literal('MIN_NOTIONAL') }),
          z.object({ filterType: z.literal('ICEBERG_PARTS') }),
          z.object({ filterType: z.literal('MARKET_LOT_SIZE') }),
          z.object({ filterType: z.literal('TRAILING_DELTA') }),
          z.object({ filterType: z.literal('MAX_NUM_ORDERS') }),
          z.object({ filterType: z.literal('MAX_POSITION') }),
          z.object({ filterType: z.literal('MAX_NUM_ALGO_ORDERS') })
        ])
      )
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
