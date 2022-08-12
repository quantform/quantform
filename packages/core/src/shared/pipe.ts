import { filter, map, Observable } from 'rxjs';

// tslint:disable-next-line: no-any
type Constructor<T> = new (...args: any[]) => T;

export function ofType<T extends K, K>(type: Constructor<T>) {
  return (input: Observable<K>) =>
    input.pipe(
      filter(it => it instanceof type),
      map(it => it as T)
    );
}
