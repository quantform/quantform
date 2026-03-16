import { useExecutionMode } from '@lib/use-execution-mode';

import { useReplayScheduler } from './replay';

export function useTimestamp() {
  const { isReplay } = useExecutionMode();

  if (isReplay) {
    return useReplayScheduler().timestamp();
  }

  return Date.now();
}
