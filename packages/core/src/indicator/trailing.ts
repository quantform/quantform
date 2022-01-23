import { filter, Observable } from 'rxjs';

export class Trailing {
  private triggered = false;
  private max = null;
  private min = null;

  constructor(readonly trigger: number, readonly buffer: number) {}

  up(value: number): boolean {
    if (value >= this.trigger) {
      this.triggered = true;
    }

    if (this.triggered) {
      if (!this.max) {
        this.max = value;
      } else {
        this.max = Math.max(this.max, value);
      }
    }

    if (this.triggered && value <= this.max - this.buffer) {
      this.triggered = false;
      this.max = null;

      return true;
    }

    return false;
  }

  down(value: number): boolean {
    if (value <= this.trigger) {
      this.triggered = true;
    }

    if (this.triggered) {
      if (!this.min) {
        this.min = value;
      } else {
        this.min = Math.min(this.min, value);
      }
    }

    if (this.triggered && value >= this.min + this.buffer) {
      this.triggered = false;
      this.min = null;

      return true;
    }

    return false;
  }
}

export function trailingup<T>(trigger: number, buffer: number, value: (it: T) => number) {
  return function (source: Observable<T>): Observable<T> {
    const trailing = new Trailing(trigger, buffer);

    return source.pipe(filter(it => trailing.up(value(it))));
  };
}

export function trailingdown<T>(
  trigger: number,
  buffer: number,
  value: (it: T) => number
) {
  return function (source: Observable<T>): Observable<T> {
    const trailing = new Trailing(trigger, buffer);

    return source.pipe(filter(it => trailing.down(value(it))));
  };
}
