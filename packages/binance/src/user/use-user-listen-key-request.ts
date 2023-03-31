import { z } from 'zod';

import { useBinanceRequest } from '@lib/use-binance-request';
import { useCredentials } from '@lib/use-credentials';

export const useUserListenKeyRequest = () => {
  const { apiKey } = useCredentials();

  return useBinanceRequest(z.object({ listenKey: z.string() }), {
    method: 'POST',
    patch: '/api/v3/userDataStream',
    query: {},
    headers: {
      'X-MBX-APIKEY': apiKey,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};
