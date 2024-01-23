import { useCredentials } from '@lib/api/use-credentials';
import { withRequest } from '@lib/api/with-request';

export const withUserListenKeyKeepAliveRequest = (listenKey: string) => {
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
