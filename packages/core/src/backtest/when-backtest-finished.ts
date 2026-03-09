import { from, last, map, Subject } from 'rxjs';

import { useExecutionMode } from '@lib/use-execution-mode';

import { useBacktestScheduler } from './use-backtest-scheduler';

export function whenBacktestFinished() {
  const { isReplay } = useExecutionMode();

  if (!isReplay) {
    return new Subject<boolean>().asObservable();
  }

  const { stream } = useBacktestScheduler();

  return from(stream).pipe(
    last(),
    map(() => true)
  );
}
