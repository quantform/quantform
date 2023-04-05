import { z } from 'zod';

import { useBinanceRequest } from '@lib/use-binance-request';
import { useCache } from '@quantform/core';

const contract = z.object({
  symbols: z.array(z.any())
});

export const useInstrumentsRequest = () =>
  useCache(
    useBinanceRequest(contract, {
      method: 'GET',
      patch: '/api/v3/exchangeInfo',
      query: {}
    }),
    ['/api/v3/exchangeInfo']
  );
