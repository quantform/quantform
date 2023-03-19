import { z } from 'zod';

import { useSignedRequest } from './use-signed-request';

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

export const useAccountSnapshot = () =>
  useSignedRequest(schema, {
    method: 'GET',
    patch: '/api/v3/account',
    query: {}
  });
