import { from, last, map, Subject } from 'rxjs';

import { useExecutionMode } from '@lib/use-execution-mode';

import { useReplayManager } from './use-replay-manager';

export function whenReplayFinished() {
  const { isReplay } = useExecutionMode();

  if (!isReplay) {
    return new Subject<boolean>().asObservable();
  }

  const { stream } = useReplayManager();

  return from(stream).pipe(
    last(),
    map(() => true)
  );
}
