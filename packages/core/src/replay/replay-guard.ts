import { Observable } from 'rxjs';

import { dependency } from '@lib/use-hash';

import { useReplayGuard } from './use-replay-guard';

export function replayGuard<T extends Array<dependency>, K>(
  fn: (...args: T) => Observable<{ timestamp: number; payload: K }>
): (...args: T) => Observable<{ timestamp: number; payload: K }> {
  return (...args: T) => useReplayGuard(fn(...args));
}
