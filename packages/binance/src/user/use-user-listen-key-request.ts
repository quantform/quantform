import { map } from 'rxjs';
import { z } from 'zod';

import { useCredentials } from '@lib/use-credentials';
import { usePublicRequest } from '@lib/use-public-request';

const responseType = z.object({ listenKey: z.string() });

export const useUserListenKeyRequest = () => {
  const { apiKey } = useCredentials();

  return usePublicRequest({
    method: 'POST',
    patch: '/api/v3/userDataStream',
    query: {},
    headers: {
      'X-MBX-APIKEY': apiKey,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).pipe(map(it => responseType.parse(it)));
};
