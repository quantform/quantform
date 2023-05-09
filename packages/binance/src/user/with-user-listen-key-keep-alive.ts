import { useCredentials } from '@lib/use-credentials';
import { withRequest } from '@lib/with-request';

export const withUserListenKeyKeepAlive = (listenKey: string) => {
  const { apiKey } = useCredentials();

  return withRequest({
    method: 'PUT',
    patch: '/api/v3/userDataStream',
    query: { listenKey },
    headers: {
      'X-MBX-APIKEY': apiKey,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};
