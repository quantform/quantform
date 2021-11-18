import { Observable } from 'rxjs';
import { share, map } from 'rxjs/operators';
import { Candle } from '../domain';
import { rma } from './rma';
import { truerange } from './truerange';

export function atr<T>(length: number, fn: (it: T) => Candle) {
  return function (source: Observable<T>): Observable<[T, number]> {
    return source.pipe(
      truerange(fn),
      rma(length, ([, tr]) => tr),
      map(([[it], truerange]) => {
        const tuple: [T, number] = [it, truerange];

        return tuple;
      }),
      share()
    );
  };
}
