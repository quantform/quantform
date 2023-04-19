import { map, Observable } from 'rxjs';

export function asReadonly<T>() {
  return (input: Observable<T>) => input.pipe(map(it => it as Readonly<T>));
}
