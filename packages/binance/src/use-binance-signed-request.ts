import { createHmac } from 'crypto';
import { join } from 'path';
import { encode } from 'querystring';

import { RequestMethod, useRequest, useTimestamp } from '@quantform/core';

import { useBinanceOptions } from './use-binance-options';

export function useBinanceSignedRequest<T>(args: {
  method: RequestMethod;
  patch: string;
  query: Record<string, string | number>;
}) {
  const { apiUrl, apiKey, apiSecret, recvWindow } = useBinanceOptions();
  const timestamp = useTimestamp();

  const url = join(apiUrl, args.patch);
  const query = encode({
    ...args.query,
    recvWindow,
    timestamp
  });
  const signature = createHmac('sha256', apiSecret!).update(query).digest('hex');

  return useRequest<T>({
    method: args.method,
    url: `${url}?${query}&signature=${signature}`,
    headers: {
      'X-MBX-APIKEY': apiKey
    }
  });
}
