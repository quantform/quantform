import { randomUUID } from 'node:crypto';
import { Observable } from 'rxjs';
import { request } from 'undici';

import { useLogger } from './use-logger';
import { useTimestamp } from './use-timestamp';

export type RequestMethod =
  | 'GET'
  | 'HEAD'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'CONNECT'
  | 'OPTIONS'
  | 'TRACE'
  | 'PATCH';

export class RequestNetworkError extends Error {
  constructor(readonly statusCode: number) {
    super(`Request network error, received status code: ${statusCode}`);
  }
}

export function withRequest({
  method,
  url,
  headers,
  body
}: {
  method: RequestMethod;
  url: string;
  headers?: Record<string, any>;
  body?: string;
}) {
  const { error, debug } = useLogger(withRequest.name);

  return new Observable<{ timestamp: number; payload: unknown }>(subscriber => {
    const correlationId = randomUUID();

    debug('requesting', { correlationId, method, url, headers, body });

    request(url, { method, headers, body })
      .then(async ({ statusCode, body }) => {
        const json = await body.json();

        debug('received', {
          correlationId,
          method,
          url,
          headers,
          body: json,
          statusCode
        });

        if (statusCode !== 200) {
          error(`errored`, {
            method,
            url,
            headers,
            body,
            statusCode
          });

          subscriber.error(new RequestNetworkError(statusCode));
        } else {
          subscriber.next({ timestamp: useTimestamp(), payload: json });
        }
      })
      .catch((e: Error) => {
        error(`errored`, {
          method,
          url,
          headers,
          body,
          error: e
        });

        subscriber.error(error);
      })
      .finally(() => subscriber.complete());
  });
}
