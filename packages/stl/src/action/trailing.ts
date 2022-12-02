import { filter, Observable } from 'rxjs';

import { decimal } from '@quantform/core';

export class Trailing {
  private triggered = false;
  private max?: decimal;
  private min?: decimal;

  constructor(readonly trigger: decimal, readonly buffer: decimal) {}

  up(value: decimal): boolean {
    if (value.greaterThanOrEqualTo(this.trigger)) {
      this.triggered = true;
    }

    if (this.triggered) {
      if (!this.max) {
        this.max = value;
      } else {
        this.max = decimal.max(this.max, value);
      }
    }

    if (
      this.triggered &&
      this.max &&
      value.lessThanOrEqualTo(this.max.minus(this.buffer))
    ) {
      this.triggered = false;
      this.max = undefined;

      return true;
    }

    return false;
  }

  down(value: decimal): boolean {
    if (value.lessThanOrEqualTo(this.trigger)) {
      this.triggered = true;
    }

    if (this.triggered) {
      if (!this.min) {
        this.min = value;
      } else {
        this.min = decimal.min(this.min, value);
      }
    }

    if (
      this.triggered &&
      this.min &&
      value.greaterThanOrEqualTo(this.min.plus(this.buffer))
    ) {
      this.triggered = false;
      this.min = undefined;

      return true;
    }

    return false;
  }
}

export function trailingUp<T>(
  trigger: decimal,
  buffer: decimal,
  value: (it: T) => decimal
) {
  return function (source: Observable<T>): Observable<T> {
    const trailing = new Trailing(trigger, buffer);

    return source.pipe(filter(it => trailing.up(value(it))));
  };
}

export function trailingDown<T>(
  trigger: decimal,
  buffer: decimal,
  value: (it: T) => decimal
) {
  return function (source: Observable<T>): Observable<T> {
    const trailing = new Trailing(trigger, buffer);

    return source.pipe(filter(it => trailing.down(value(it))));
  };
}
