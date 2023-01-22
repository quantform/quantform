import { concatMap, map, Observable } from 'rxjs';

import { useBacktesting } from '@lib/useBacktesting';
import { useExecutionMode } from '@lib/useExecutionMode';
import { useSampler } from '@lib/useSampler';

export function useReplay<T>(
  input: Observable<{ timestamp: number; payload: T }>,
  dependencies: unknown[]
) {
  const { mode, recording } = useExecutionMode();

  if (mode === 'TEST') {
    const { subscribe } = useBacktesting();

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
