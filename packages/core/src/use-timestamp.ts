import { useExecutionMode } from '@lib/use-execution-mode';

import { useBacktestScheduler } from './backtest';

export function useTimestamp() {
  const { isReplay } = useExecutionMode();

  if (isReplay) {
    return useBacktestScheduler().timestamp();
  }

  return Date.now();
}
