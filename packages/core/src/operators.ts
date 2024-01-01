import { filter, map, Observable } from 'rxjs';

export function asReadonly<T>() {
  return (input: Observable<T>) => input.pipe(map(it => it as Readonly<T>));
}

export function defined<T>() {
  return (observable: Observable<T | undefined | null>) =>
    observable.pipe(filter(it => it !== undefined && it !== null));
}

export function exclude<T, S extends symbol>(s: S) {
  return (observable: Observable<T | S>) =>
    observable.pipe(
      filter(it => it !== s),
      map(it => it as Exclude<T, typeof s>)
    );
}
