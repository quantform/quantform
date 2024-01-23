import { createHmac } from 'crypto';
import queryString from 'query-string';
import { defer } from 'rxjs';

import { useCredentials } from '@lib/api/use-credentials';
import { useOptions } from '@lib/use-options';
import { RequestMethod, useTimestamp } from '@quantform/core';

import { withRequest } from './with-request';

export function withSignedRequest({
  method,
  patch,
  query,
  body
}: {
  method: RequestMethod;
  patch: string;
  query?: Record<string, string | number | undefined>;
  body?: string;
}) {
  const { recvWindow } = useOptions();
  const { apiKey, apiSecret } = useCredentials();

  return defer(() => {
    const timestamp = useTimestamp();
    const signature = createHmac('sha256', apiSecret)
      .update(
        queryString.stringify(
          {
            ...query,
            recvWindow,
            timestamp
          },
          {
            sort: false
          }
        )
      )
      .digest('hex');

    return withRequest({
      method,
      patch,
      query: { ...query, recvWindow, timestamp, signature },
      body,
      headers: {
        'X-MBX-APIKEY': apiKey
      }
    });
  });
}
