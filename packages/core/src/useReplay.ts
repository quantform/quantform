import { concatMap, map, Observable } from 'rxjs';

import { useExecutionMode } from '@lib/useExecutionMode';
import { useSampler } from '@lib/useSampler';
import { useSampleStreamer } from '@lib/useSampleStreamer';

export function useReplay<T>(
  input: Observable<{ timestamp: number; payload: T }>,
  dependencies: unknown[]
) {
  const { simulation: real, recording } = useExecutionMode();

  if (real) {
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

  const { subscribe } = useSampleStreamer();

  return subscribe(dependencies).pipe(
    map(it => it as unknown as { timestamp: number; payload: T })
  );
}
