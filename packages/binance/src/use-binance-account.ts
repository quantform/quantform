import { z } from 'zod';

import { decimal } from '@quantform/core';

import { useBinanceSignedRequest } from './use-binance-signed-request';

const schema = z.object({
  makerCommission: z.number(),
  takerCommission: z.number(),
  balances: z.array(
    z.object({
      asset: z.string(),
      free: z.instanceof(decimal),
      locked: z.instanceof(decimal)
    })
  )
});

export const useBinanceAccount = () =>
  useBinanceSignedRequest(schema, {
    method: 'GET',
    patch: '/api/v3/account',
    query: {}
  });
