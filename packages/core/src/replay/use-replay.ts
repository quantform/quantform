import { concatMap, map, Observable } from 'rxjs';

import { useReplayController } from '@lib/replay/use-replay-controller';
import { useExecutionMode } from '@lib/use-execution-mode';
import { dependency } from '@lib/use-hash';

import { useReplayWriter } from './use-replay-writer';

export function useReplay<T>(
  input: Observable<{ timestamp: number; payload: T }>,
  dependencies: dependency[]
) {
  const { mode, recording } = useExecutionMode();

  if (mode === 'REPLAY') {
    const { subscribe } = useReplayController();

    return subscribe(dependencies).pipe(
      map(it => it as unknown as { timestamp: number; payload: T })
    );
  }

  if (recording) {
    const writer = useReplayWriter(dependencies);
    return input.pipe(
      concatMap(async it => {
        await writer([it]);
        return it;
      })
    );
  }

  return input;
}
