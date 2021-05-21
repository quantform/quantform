import { Observable } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';
import { RingBuffer } from './ring-buffer';
import { WindowIndicator } from './window-indicator';

export class SWMA extends WindowIndicator<number> {
  private _value;

  get value(): number {
    return this._value;
  }

  constructor() {
    super(4);
  }

  calculate(added: number, removed: number, buffer: RingBuffer<number>) {
    if (!this.isCompleted) {
      return;
    }

    const x3 = buffer.at(this.capacity - (3 + 1));
    const x2 = buffer.at(this.capacity - (2 + 1));
    const x1 = buffer.at(this.capacity - (1 + 1));
    const x0 = buffer.at(this.capacity - (0 + 1));

    this._value = (x3 * 1) / 6 + (x2 * 2) / 6 + (x1 * 2) / 6 + (x0 * 1) / 6;
  }
}

export function swma<T>(fn: (it: T) => number) {
  return function(source: Observable<T>): Observable<SWMA> {
    const indicator = new SWMA();

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
