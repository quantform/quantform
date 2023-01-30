import { map } from 'rxjs';
import { ajax } from 'rxjs/ajax';

export function useRequest<T>(args: {
  method: string;
  url: string;
  headers: Record<string, any>;
}) {
  return ajax({
    ...args
  }).pipe(map(it => it.response as T));
}
