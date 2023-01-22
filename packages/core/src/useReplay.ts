import { concatMap, map, Observable } from 'rxjs';

import { useExecutionMode } from '@lib/useExecutionMode';
import { useReplayController } from '@lib/useReplayController';
import { useSampler } from '@lib/useSampler';

export function useReplay<T>(
  input: Observable<{ timestamp: number; payload: T }>,
  dependencies: unknown[]
) {
  const { mode, recording } = useExecutionMode();

  if (mode === 'REPLAY') {
    const { subscribe } = useReplayController();

    return subscribe(dependencies).pipe(
      map(it => it as unknown as { timestamp: number; payload: T })
    );
  }

  if (recording) {
    const { write } = useSampler(dependencies);
    return input.pipe(
      concatMap(async it => {
        await write([it]);
        return it;
      })
    );
  }

  return input;
}
