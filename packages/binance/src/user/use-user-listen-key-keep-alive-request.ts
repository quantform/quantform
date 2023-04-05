import { z } from 'zod';

import { useCredentials } from '@lib/use-credentials';
import { usePublicRequest } from '@lib/use-public-request';

export const useUserListenKeyKeepAliveRequest = (listenKey: string) => {
  const { apiKey } = useCredentials();

  return usePublicRequest(z.object({}), {
    method: 'PUT',
    patch: '/api/v3/userDataStream',
    query: { listenKey },
    headers: {
      'X-MBX-APIKEY': apiKey,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};
