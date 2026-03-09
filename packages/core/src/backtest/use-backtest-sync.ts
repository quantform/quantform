import { finalize, Observable } from 'rxjs';

import { useExecutionMode } from '@lib/use-execution-mode';

import { useBacktestScheduler } from './use-backtest-scheduler';

export function useBacktestSync<T>(input: Observable<T>): Observable<T> {
  const { isReplay } = useExecutionMode();

  if (!isReplay) {
    return input;
  }

  const { stop, tryContinue } = useBacktestScheduler();

  stop();

  return input.pipe(finalize(() => tryContinue()));
}
