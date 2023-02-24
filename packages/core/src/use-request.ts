import { from, map, Observable, of, retry, switchMap, throwError } from 'rxjs';
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
        return throwError(() => new Error(it.statusCode.toString()));
      }

      return it.body.json();
    }),
    map(it => it as T)
  );
}
