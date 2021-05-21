import { Observable } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';
import { RingBuffer } from './ring-buffer';
import { WindowIndicator } from './window-indicator';

export class SMA extends WindowIndicator<number> {
  private _accmulated = 0;
  private _value: number;

  get value(): number {
    return this._value;
  }

  constructor(capacity: number) {
    super(capacity);
  }

  calculate(added: number, removed: number, buffer: RingBuffer<number>) {
    this._accmulated += added;
    this._accmulated -= removed;

    this._value = this._accmulated / buffer.size;
  }
}

export function sma<T>(length: number, fn: (it: T) => number) {
  return function(source: Observable<T>): Observable<SMA> {
    const indicator = new SMA(length);

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
