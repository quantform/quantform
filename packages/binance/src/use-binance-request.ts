import { createHmac } from 'crypto';
import { join } from 'path';
import { encode } from 'querystring';

import { useRequest } from '@quantform/core';

import { useBinanceOptions } from './use-binance-options';

export function useBinanceRequest<T>(args: {
  method: string;
  patch: string;
  query: Record<string, string | number>;
}) {
  const { apiKey, apiSecret } = useBinanceOptions();

  const url = join('https://api.binance.com', args.patch);
  const query = encode(args.query);
  const signature = createHmac('sha256', apiSecret!).update(query).digest('hex');

  return useRequest<T>({
    method: args.method,
    url: `${url}?${query}&signature=${signature}`,
    headers: {
      'X-MBX-APIKEY': apiKey
    }
  });
}
