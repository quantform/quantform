import { from, map, switchMap } from 'rxjs';
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
}) {
  return from(
    request(args.url, {
      method: args.method,
      headers: args.headers
    })
  ).pipe(
    switchMap(it => it.body.json()),
    map(it => it as T)
  );
}
