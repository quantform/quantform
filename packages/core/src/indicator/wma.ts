import { Observable } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';
import { RingBuffer } from './ring-buffer';
import { SMA } from './sma';
import { WindowIndicator } from './window-indicator';

export class WMA extends WindowIndicator<number> {
  private _k = 0;
  private _sma: SMA;
  private _value: number;

  get value(): number {
    return this._value;
  }

  constructor(capacity: number) {
    super(capacity);

    this._k = 1.0 / capacity;
    this._sma = new SMA(capacity);
  }

  calculate(added: number, removed: number, buffer: RingBuffer<number>) {
    if (!this.isCompleted) {
      return;
    }

    let norm = 0.0;
    let sum = 0.0;

    for (let i = 0; i < this.capacity; i++) {
      const weight = (this.capacity - i) * this.capacity;
      norm = norm + weight;

      sum = sum + buffer.at(this.capacity - (i + 1)) * weight;
    }

    this._value = sum / norm;
  }
}

export function wma<T>(length: number, fn: (it: T) => number) {
  return function(source: Observable<T>): Observable<WMA> {
    const indicator = new WMA(length);

    return source.pipe(
      filter(it => {
        indicator.append(fn(it));

        return indicator.isCompleted;
      }),
      map(_ => indicator),
      share()
    );
  };
}
