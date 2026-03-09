import { Observable } from 'rxjs';

import { Query, QueryObject } from '@lib/storage';
import { useExecutionMode } from '@lib/use-execution-mode';

import { useBacktestScheduler } from './use-backtest-scheduler';

export interface BacktestStorage<V> {
  query(
    query: Query<QueryObject> & { where: { timestamp: { min: number; max: number } } }
  ): Promise<{ timestamp: number; payload: V }[]>;
}

export function useBacktest<T>(
  input: Observable<{ timestamp: number; payload: T }>,
  query: BacktestStorage<T>
) {
  const { isReplay } = useExecutionMode();

  if (isReplay) {
    const { watch } = useBacktestScheduler();
    return watch<T>(query);
  }

  return input;
}
