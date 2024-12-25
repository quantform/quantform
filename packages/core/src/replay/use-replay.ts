import { Observable, tap } from 'rxjs';

import { useExecutionMode } from '@lib/use-execution-mode';
import { dependency } from '@lib/use-hash';

import { useReplayStorage } from './storage/use-replay-storage';
import { useReplayManager } from './use-replay-manager';

export function useReplay<T>(
  input: Observable<{ timestamp: number; payload: T }>,
  dependencies: dependency[]
) {
  const { isReplay, recording } = useExecutionMode();

  if (isReplay) {
    const { watch } = useReplayManager();

    return watch<T>(dependencies);
  }

  if (recording) {
    const { save } = useReplayStorage<T>(dependencies);

    return input.pipe(tap(it => save([it])));
  }

  return input;
}
