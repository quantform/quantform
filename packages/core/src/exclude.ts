import { filter, map, Observable } from 'rxjs';

export function exclude<T, S extends symbol>(s: S) {
  return (observable: Observable<T | S>) =>
    observable.pipe(
      filter(it => it !== s),
      map(it => it as Exclude<T, typeof s>)
    );
}
