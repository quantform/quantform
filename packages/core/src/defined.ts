import { filter, Observable } from 'rxjs';

export function defined<T>() {
  return (observable: Observable<T | undefined | null>) =>
    observable.pipe(filter(it => it !== undefined && it !== null));
}
