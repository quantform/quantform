import { finalize, Observable } from 'rxjs';

import { useExecutionMode } from '@lib/use-execution-mode';
import { useLogger } from '@lib/use-logger';

import { useReplayManager } from './use-replay-manager';

export function useReplayBreakpoint<T>(input: Observable<T>): Observable<T> {
  const { isReplay } = useExecutionMode();

  if (!isReplay) {
    return input;
  }

  const { info } = useLogger('replay');
  const { stop, tryContinue } = useReplayManager();

  info('breakpoint acquired');

  stop();

  return input.pipe(
    finalize(() => {
      info('breakpoint released');

      tryContinue();
    })
  );
}
