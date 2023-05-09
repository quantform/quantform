import { createHmac } from 'crypto';
import { join } from 'path';
import { encode } from 'querystring';
import { defer } from 'rxjs';

import { RequestMethod, useRequest, useTimestamp } from '@quantform/core';

import { useOptions } from './use-options';

export function withSignedRequest(args: {
  method: RequestMethod;
  patch: string;
  query?: Record<string, string | number | undefined>;
  body?: string;
}) {
  const { apiUrl, apiKey, apiSecret, recvWindow } = useOptions();

  return defer(() => {
    const url = join(apiUrl, args.patch);
    const query = encode({
      ...args.query,
      recvWindow,
      timestamp: useTimestamp()
    });
    const signature = createHmac('sha256', apiSecret!).update(query).digest('hex');

    return useRequest({
      method: args.method,
      url: `${url}?${query}&signature=${signature}`,
      headers: {
        'X-MBX-APIKEY': apiKey
      },
      body: args.body
    });
  });
}
