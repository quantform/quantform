import { z } from 'zod';

import { useBinanceSignedRequest } from './use-binance-signed-request';

const schema = z.object({
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

export const useBinanceAccount = () =>
  useBinanceSignedRequest(schema, {
    method: 'GET',
    patch: '/api/v3/account',
    query: {}
  });
