import { concatMap, map, Observable } from 'rxjs';

import { useExecutionMode } from '@lib/use-execution-mode';
import { useReplayController } from '@lib/use-replay-controller';
import { useSampler } from '@lib/use-sampler';

import { dependency } from './use-hash';

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
