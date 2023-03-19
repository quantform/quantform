import { createHmac } from 'crypto';
import { join } from 'path';
import { encode } from 'querystring';
import { defer } from 'rxjs';
import { ZodType } from 'zod';

import { RequestMethod, useRequest, useTimestamp } from '@quantform/core';

import { useBinanceLogger } from './use-logger';
import { useOptions } from './use-options';

export function useSignedRequest<T extends ZodType>(
  schema: T,
  args: {
    method: RequestMethod;
    patch: string;
    query?: Record<string, string | number | undefined>;
  }
) {
  const { apiUrl, apiKey, apiSecret, recvWindow } = useOptions();

  const url = join(apiUrl, args.patch);
  const query = encode({
    ...args.query,
    recvWindow,
    timestamp: useTimestamp()
  });
  const signature = createHmac('sha256', apiSecret!).update(query).digest('hex');

  const { debug } = useBinanceLogger();

  return defer(() => {
    debug(`requesting`, args);

    return useRequest<T>(schema, {
      method: args.method,
      url: `${url}?${query}&signature=${signature}`,
      headers: {
        'X-MBX-APIKEY': apiKey
      }
    });
  });
}
