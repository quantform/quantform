import decimal from 'decimal.js';
import { from, map, Observable, switchMap, throwError } from 'rxjs';
import { request } from 'undici';
import { z, ZodType } from 'zod';

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

export function useRequest<T extends ZodType>(
  schema: T,
  args: {
    method: RequestMethod;
    url: string;
    headers?: Record<string, any>;
    body?: string;
  }
): Observable<z.infer<typeof schema>> {
  return from(
    request(args.url, {
      method: args.method,
      headers: args.headers,
      body: args.body
    })
  ).pipe(
    switchMap(it => {
      if (it.statusCode !== 200) {
        return throwError(
          () => new RequestNetworkError(it.statusCode, () => it.body.json())
        );
      }

      return from(it.body.json());
    }),
    map(it => schema.parse(it))
  );
}
