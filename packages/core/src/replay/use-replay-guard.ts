import { finalize, Observable } from 'rxjs';

import { useExecutionMode } from '@lib/use-execution-mode';
import { useLogger } from '@lib/use-logger';

import { useReplayManager } from './use-replay-manager';

export function useReplayGuard<T>(input: Observable<T>): Observable<T> {
  const { isReplay } = useExecutionMode();
  const { info } = useLogger('useReplayGuard');
  const { stop, tryContinue } = useReplayManager();

  if (isReplay) {
    info('locking resource...');

    stop();

    return input.pipe(
      finalize(() => {
        info('unlocking resource');

        tryContinue();
      })
    );
  }

  return input;
}
