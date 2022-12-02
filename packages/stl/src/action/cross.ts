import { filter, Observable } from 'rxjs';

import { decimal } from '@quantform/core';

export function crossUnder<T>(
  trigger: decimal | ((it: T) => decimal),
  value: (it: T) => decimal
) {
  return function (source: Observable<T>): Observable<T> {
    let triggered = false;

    return source.pipe(
      filter(it => {
        const limit = typeof trigger == 'function' ? trigger(it) : trigger;
        const current = value(it);

        if (current.lessThan(limit)) {
          triggered = true;
        }

        if (triggered && current.greaterThan(limit)) {
          triggered = false;

          return true;
        }

        return false;
      })
    );
  };
}

export function crossOver<T>(
  trigger: decimal | ((it: T) => decimal),
  value: (it: T) => decimal
) {
  return function (source: Observable<T>): Observable<T> {
    let triggered = false;

    return source.pipe(
      filter(it => {
        const limit = typeof trigger == 'function' ? trigger(it) : trigger;
        const current = value(it);

        if (current.greaterThan(limit)) {
          triggered = true;
        }

        if (triggered && current.lessThan(limit)) {
          triggered = false;

          return true;
        }

        return false;
      })
    );
  };
}
