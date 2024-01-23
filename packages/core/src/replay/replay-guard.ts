import { Observable } from 'rxjs';

import { dependency } from '@lib/use-hash';

import { useReplayBreakpoint } from './use-replay-breakpoint';

export function replayGuard<T extends Array<dependency>, K>(
  fn: (...args: T) => Observable<{ timestamp: number; payload: K }>
): (...args: T) => Observable<{ timestamp: number; payload: K }> {
  return (...args: T) => useReplayBreakpoint(fn(...args));
}
