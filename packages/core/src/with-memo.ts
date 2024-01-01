import { isObservable, Observable, shareReplay } from 'rxjs';
import { v4 } from 'uuid';

import { throwWithContext } from './module';
import { asReadonly } from './operators';
import { dependency } from './use-hash';
import { useMemo } from './use-memo';

export function withMemo<T extends Array<dependency>, U>(
  fn: (...args: T) => U
): (...args: T) => U;
export function withMemo<T extends Array<dependency>, U>(
  fn: (...args: T) => Observable<U>
): (...args: T) => Observable<U>;

export function withMemo<T extends Array<dependency>, U>(
  fn: (...args: T) => U | Observable<U>
): (...args: T) => U | Observable<U> {
  throwWithContext();

  const uniqueId = v4();

  return (...args: T): U | Observable<U> =>
    useMemo(() => {
      const value = fn(...args);

      if (isObservable(value)) {
        return value.pipe(asReadonly(), shareReplay(1));
      }

      return value;
    }, [uniqueId, ...args]);
}
