import { Observable } from 'rxjs';
import { share } from 'rxjs/operators';
import { SWMA, swma } from './swma';
import { wma } from './wma';

export function tma<T>(length: number, fn: (it: T) => number) {
  return function(source: Observable<T>): Observable<SWMA> {
    return source.pipe(
      wma(length, fn),
      swma(it => it.value),
      share()
    );
  };
}
