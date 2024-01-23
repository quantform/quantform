import { map } from 'rxjs';
import { z } from 'zod';

import { withRequest } from '@lib/api/with-request';
import { useCache, useExecutionMode, useReplayBreakpoint } from '@quantform/core';

import { withSimulator } from './simulator';

export const responseType = z.object({
  symbols: z.array(
    z.object({
      symbol: z.string(),
      baseAsset: z.string(),
      quoteAsset: z.string(),
      filters: z.array(z.any())
    })
  )
});

export function request() {
  return useReplayBreakpoint(
    useCache(
      withRequest({
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
    )
  );
}

export function withExchangeInfoRequest(): ReturnType<typeof request> {
  const { isSimulation } = useExecutionMode();

  if (!isSimulation) {
    return request();
  }

  return withSimulator().pipe(
    map(({ apply }) => apply(simulator => simulator.withExchangeInfo()))
  );
}
