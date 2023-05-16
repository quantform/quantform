import { defer, from, map, switchMap, throwError } from 'rxjs';
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
  constructor(readonly statusCode: number, readonly json: () => Promise<string>) {
    super(`Request network error, received status code: ${statusCode}`);
  }
}

export function withRequest(args: {
  method: RequestMethod;
  url: string;
  headers?: Record<string, any>;
  body?: string;
}) {
  const { error } = useLogger(withRequest.name);

  return defer(() =>
    from(request(args.url, args)).pipe(
      switchMap(it => {
        if (it.statusCode !== 200) {
          error(`errored`, {
            ...args,
            statusCode: it.statusCode
          });

          return throwError(
            () => new RequestNetworkError(it.statusCode, () => it.body.json())
          );
        }

        return from(it.body.json());
      }),
      map(payload => ({ timestamp: useTimestamp(), payload }))
    )
  );
}
