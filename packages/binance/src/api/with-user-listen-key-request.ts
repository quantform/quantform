import { map } from 'rxjs';
import { z } from 'zod';

import { useCredentials } from '@lib/api/use-credentials';
import { withRequest } from '@lib/api/with-request';

const responseType = z.object({ listenKey: z.string() });

export const withUserListenKeyRequest = () => {
  const { apiKey } = useCredentials();

  return withRequest({
    method: 'POST',
    patch: '/api/v3/userDataStream',
    query: {},
    headers: {
      'X-MBX-APIKEY': apiKey,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).pipe(
    map(({ timestamp, payload }) => ({ timestamp, payload: responseType.parse(payload) }))
  );
};
