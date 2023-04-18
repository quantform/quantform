import { useBinanceCredentials } from '@lib/use-binance-credentials';
import { useBinanceRequest } from '@lib/use-binance-request';

export const useBinanceUserListenKeyKeepAliveRequest = (listenKey: string) => {
  const { apiKey } = useBinanceCredentials();

  return useBinanceRequest({
    method: 'PUT',
    patch: '/api/v3/userDataStream',
    query: { listenKey },
    headers: {
      'X-MBX-APIKEY': apiKey,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};
