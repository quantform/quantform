import { Observable } from 'rxjs';

import { dependency } from '@lib/use-hash';
import { withMemo } from '@lib/with-memo';

import { useReplay } from './use-replay';

export function replay<T extends Array<dependency>, K>(
  fn: (...args: T) => Observable<{ timestamp: number; payload: K }>,
  dependencies: dependency[]
): (...args: T) => Observable<{ timestamp: number; payload: K }> {
  return withMemo((...args: T) => useReplay(fn(...args), [...dependencies, ...args]));
}
