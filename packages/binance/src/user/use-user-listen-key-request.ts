import { z } from 'zod';

import { useCredentials } from '@lib/use-credentials';
import { usePublicRequest } from '@lib/use-public-request';

export const useUserListenKeyRequest = () => {
  const { apiKey } = useCredentials();

  return usePublicRequest(z.object({ listenKey: z.string() }), {
    method: 'POST',
    patch: '/api/v3/userDataStream',
    query: {},
    headers: {
      'X-MBX-APIKEY': apiKey,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};
