import { createHmac } from 'crypto';
import { join } from 'path';
import { encode } from 'querystring';
import { defer } from 'rxjs';

import { RequestMethod, useTimestamp } from '@quantform/core';

import { useOptions } from './use-options';
import { withRequest } from './with-request';

export function withSignedRequest(args: {
  method: RequestMethod;
  patch: string;
  query?: Record<string, string | number | undefined>;
  body?: string;
}) {
  const { apiKey, apiSecret, recvWindow } = useOptions();

  return defer(() => {
    const query = encode({
      ...args.query,
      recvWindow,
      timestamp: useTimestamp()
    });
    const signature = createHmac('sha256', apiSecret!).update(query).digest('hex');

    return withRequest({
      method: args.method,
      patch: args.patch,
      query: { ...args.query, recvWindow, timestamp: useTimestamp(), signature },
      headers: {
        'X-MBX-APIKEY': apiKey
      },
      body: args.body
    });
  });
}
