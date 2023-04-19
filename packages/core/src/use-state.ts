import { BehaviorSubject, Observable } from 'rxjs';

import { useMemo } from '@lib/use-memo';

import { dependency } from './use-hash';

export function useState<T>(
  initialValue: T,
  dependencies: dependency[]
): [Observable<Readonly<T>>, (value: T | ((p: T) => T)) => Readonly<T>] {
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

      return state.value;
    };

    return [state.asObservable(), setState];
  }, dependencies);
}
