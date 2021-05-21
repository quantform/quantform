import { Observable } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';
import { SMA } from './sma';

export function envelope<T>(length: number, percent: number, valueFn: (it: T) => number) {
  return function(source: Observable<T>): Observable<{ min: number; max: number }> {
    const indicator = new SMA(length);

    return source.pipe(
      filter(it => {
        indicator.append(valueFn(it));

        return indicator.isCompleted;
      }),
      map(it => {
        const offset = (indicator.value * percent) / 100;

        return {
          min: indicator.value - offset,
          max: indicator.value + offset
        };
      }),
      share()
    );
  };
}
