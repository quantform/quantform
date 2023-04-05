import { z } from 'zod';

import { usePublicRequest } from '@lib/use-public-request';
import { useCache } from '@quantform/core';

const contract = z.object({
  symbols: z.array(z.any())
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
