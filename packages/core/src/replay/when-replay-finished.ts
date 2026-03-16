import { from, last, map, Subject } from 'rxjs';

import { useExecutionMode } from '@lib/use-execution-mode';

import { useReplayScheduler } from './use-replay-scheduler';

export function whenReplayFinished() {
  const { isReplay } = useExecutionMode();

  if (!isReplay) {
    return new Subject<boolean>().asObservable();
  }

  const { stream } = useReplayScheduler();

  return from(stream).pipe(
    last(),
    map(() => true)
  );
}
