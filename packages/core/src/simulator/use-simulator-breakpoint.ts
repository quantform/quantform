import { Observable } from 'rxjs';

import { useReplayBreakpoint } from '@lib/replay';

import { useSimulator } from './use-simulator';

export function useSimulatorBreakpoint<T>(input: Observable<T>): Observable<T> {
  return useSimulator(useReplayBreakpoint(input), input);
}
