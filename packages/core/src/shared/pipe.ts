import { filter, map, Observable } from 'rxjs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new (...args: any[]) => T;

export function ofType<T extends K, K>(type: Constructor<T>) {
  return (input: Observable<K>) =>
    input.pipe(
      filter(it => it instanceof type),
      map(it => it as T)
    );
}
