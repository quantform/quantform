import { Observable, tap } from 'rxjs';

import { useExecutionMode } from '@lib/use-execution-mode';
import { dependency } from '@lib/use-hash';

import { useReplayManager } from './use-replay-manager';
import { useReplayStorage } from './use-replay-storage';

export function useReplay<T>(
  input: Observable<{ timestamp: number; payload: T }>,
  dependencies: dependency[]
) {
  const { isReplay, recording } = useExecutionMode();

  if (isReplay) {
    const { when } = useReplayManager();

    return when<T>(dependencies);
  }

  if (recording) {
    const { save } = useReplayStorage<T>(dependencies);

    return input.pipe(
      tap(it => {
        save([it]);
      })
    );
  }

  return input;
}
