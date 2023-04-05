import { z } from 'zod';

import { useSignedRequest } from '@lib/use-signed-request';

const contract = z.object({
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

export const useUserAccountRequest = () =>
  useSignedRequest(contract, {
    method: 'GET',
    patch: '/api/v3/account',
    query: {}
  });
