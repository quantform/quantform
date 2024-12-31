import { Observable } from 'rxjs';

import { dependency } from '@lib/use-hash';

import { useReplayLock } from './use-replay-lock';

export function replayGuard<T extends Array<dependency>, K>(
  fn: (...args: T) => Observable<{ timestamp: number; payload: K }>
): (...args: T) => Observable<{ timestamp: number; payload: K }> {
  return (...args: T) => useReplayLock(fn(...args));
}
