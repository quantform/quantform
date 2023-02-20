import { from, map, switchMap, tap } from 'rxjs';
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
    switchMap(it => it.body.json()),
    map(it => it as T)
  );
}
