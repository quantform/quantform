import { map } from 'rxjs';
import { z } from 'zod';

import { useBinanceSignedRequest } from '@lib/use-binance-signed-request';

const responseType = z.object({
  makerCommission: z.number(),
  takerCommission: z.number(),
  balances: z.array(
    z.object({
      asset: z.string(),
      free: z.string(),
      locked: z.string()
    })
  )
});

export const useBinanceUserAccountRequest = () =>
  useBinanceSignedRequest({
    method: 'GET',
    patch: '/api/v3/account',
    query: {}
  }).pipe(
    map(({ timestamp, payload }) => ({
      timestamp,
      payload: responseType.parse(payload)
    }))
  );
