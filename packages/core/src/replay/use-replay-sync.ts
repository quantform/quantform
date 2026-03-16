import { finalize, Observable } from 'rxjs';

import { useExecutionMode } from '@lib/use-execution-mode';

import { useReplayScheduler } from './use-replay-scheduler';

export function useReplaySync<T>(input: Observable<T>): Observable<T> {
  const { isReplay } = useExecutionMode();

  if (!isReplay) {
    return input;
  }

  const { stop, tryContinue } = useReplayScheduler();

  stop();

  return input.pipe(finalize(() => tryContinue()));
}
