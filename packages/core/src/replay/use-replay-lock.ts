import { finalize, Observable } from 'rxjs';

import { useExecutionMode } from '@lib/use-execution-mode';
import { useLogger } from '@lib/use-logger';

import { useReplayManager } from './use-replay-manager';

export function useReplayLock<T>(input: Observable<T>): Observable<T> {
  const { isReplay } = useExecutionMode();

  if (!isReplay) {
    return input;
  }

  const { info } = useLogger('replay');
  const { stop, tryContinue } = useReplayManager();

  info('lock acquired');

  stop();

  return input.pipe(
    finalize(() => {
      info('lock released');

      tryContinue();
    })
  );
}
