import { BehaviorSubject, map, Observable, ReplaySubject } from 'rxjs';

import { useMemo } from '@lib/use-memo';

export function useState<T>(
  initialValue: T | undefined,
  dependencies: unknown[]
): [Observable<T>, (value: T) => void] {
  return useMemo(() => {
    const state = initialValue
      ? new BehaviorSubject<T>(initialValue)
      : new ReplaySubject<T>(1);

    const setState = (newState: T) => state.next(newState);

    return [state.asObservable(), setState];
  }, dependencies);
}
