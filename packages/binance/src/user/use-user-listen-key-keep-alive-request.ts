import { z } from 'zod';

import { useBinanceRequest } from '@lib/use-binance-request';
import { useCredentials } from '@lib/use-credentials';

export const useUserListenKeyKeepAliveRequest = (listenKey: string) => {
  const { apiKey } = useCredentials();

  return useBinanceRequest(z.object({}), {
    method: 'PUT',
    patch: '/api/v3/userDataStream',
    query: { listenKey },
    headers: {
      'X-MBX-APIKEY': apiKey,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};
