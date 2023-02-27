import { from, map, switchMap, throwError } from 'rxjs';
import { request } from 'undici';

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

export function useRequest<T>(args: {
  method: RequestMethod;
  url: string;
  headers: Record<string, any>;
  body?: string;
}) {
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
    map(it => it as T)
  );
}
