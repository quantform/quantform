import { map } from 'rxjs';
import { z } from 'zod';

import { useBinanceCredentials } from '@lib/use-binance-credentials';
import { useBinanceRequest } from '@lib/use-binance-request';

const responseType = z.object({ listenKey: z.string() });

export const useBinanceUserListenKeyRequest = () => {
  const { apiKey } = useBinanceCredentials();

  return useBinanceRequest({
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
