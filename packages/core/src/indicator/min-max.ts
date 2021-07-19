import { Observable } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';
import { RingBuffer } from './ring-buffer';
import { WindowIndicator } from './window-indicator';

export class MinMax extends WindowIndicator<number> {
  private _min = 0;
  private _max = 0;

  get min(): number {
    return this._min;
  }

  get max(): number {
    return this._max;
  }

  constructor(capacity: number) {
    super(capacity);
  }

  calculate(added: number, removed: number, buffer: RingBuffer<number>) {
    this._min = added;
    this._max = added;

    buffer.forEach(it => {
      this._min = Math.min(it, this._min);
      this._max = Math.max(it, this._max);
    });
  }
}

export function minMax<T>(length: number, fn: (it: T) => number) {
  return function(source: Observable<T>): Observable<MinMax> {
    const indicator = new MinMax(length);

    return source.pipe(
      filter(it => {
        indicator.append(fn(it));

        return indicator.isCompleted;
      }),
      map(() => indicator),
      share()
    );
  };
}
