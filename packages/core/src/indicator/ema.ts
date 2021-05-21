import { Observable } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';
import { SMA } from './sma';
import { WindowIndicator } from './window-indicator';

export class EMA extends WindowIndicator<number> {
  private _alpha = 0;
  private _sma: SMA;
  private _value = null;

  get value(): number {
    return this._value;
  }

  constructor(capacity: number) {
    super(capacity);

    this._alpha = 2.0 / (capacity + 1);
    this._sma = new SMA(capacity);
  }

  calculate(added: number) {
    this._sma.append(added);

    if (!this._sma.isCompleted) {
      return;
    }

    if (!this.value) {
      this._value = this._sma.value;
    } else {
      //this._value = (added - this._value) * this._alpha + this._value;

      this._value = this._alpha * added + (1.0 - this._alpha) * this._value;
    }
  }
}

export function ema<T>(length: number, fn: (it: T) => number) {
  return function(source: Observable<T>): Observable<EMA> {
    const indicator = new EMA(length);

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
