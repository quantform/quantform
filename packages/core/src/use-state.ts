import { BehaviorSubject, Observable } from 'rxjs';

import { useMemo } from '@lib/use-memo';

export function useState<T>(
  initialValue: T,
  dependencies: unknown[]
): [Observable<T>, (value: T | ((p: T) => T)) => Observable<T>] {
  return useMemo(() => {
    const state = new BehaviorSubject<T>(initialValue);

    const setState = (newState: T | ((prevState: T) => T | undefined)) => {
      if (newState instanceof Function) {
        const value = newState(state.value);

        if (value) {
          state.next(value);
        }
      } else {
        state.next(newState);
      }

      return state.asObservable();
    };

    return [state.asObservable(), setState];
  }, dependencies);
}
