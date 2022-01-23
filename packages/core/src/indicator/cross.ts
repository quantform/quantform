import { filter, Observable } from 'rxjs';

export function crossunder<T>(limitFn: (it: T) => number, currentFn: (it: T) => number) {
  return function (source: Observable<T>): Observable<T> {
    let triggered = false;

    return source.pipe(
      filter(it => {
        const limit = limitFn(it);
        const current = currentFn(it);

        if (current < limit) {
          triggered = true;
        }

        if (triggered && current > limit) {
          triggered = false;

          return true;
        }

        return false;
      })
    );
  };
}

export function crossover<T>(limitFn: (it: T) => number, currentFn: (it: T) => number) {
  return function (source: Observable<T>): Observable<T> {
    let triggered = false;

    return source.pipe(
      filter(it => {
        const limit = limitFn(it);
        const current = currentFn(it);

        if (current > limit) {
          triggered = true;
        }

        if (triggered && current < limit) {
          triggered = false;

          return true;
        }

        return false;
      })
    );
  };
}
