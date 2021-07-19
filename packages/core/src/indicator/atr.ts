import { Observable } from 'rxjs';
import { share } from 'rxjs/operators';
import { Candle } from '../domain';
import { rma, RMA } from './rma';
import { truerange } from './truerange';

export function atr<T>(length: number, fn: (it: T) => Candle) {
  return function(source: Observable<T>): Observable<RMA> {
    return source.pipe(
      truerange(fn),
      rma(length, it => it),
      share()
    );
  };
}
