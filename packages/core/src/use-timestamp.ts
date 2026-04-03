import { useExecutionMode } from '@lib/use-execution-mode';

import { useReplayScheduler } from './replay';
import { now } from './shared';

export function useTimestamp() {
  const { isReplay } = useExecutionMode();

  if (isReplay) {
    return { timestamp: useReplayScheduler().timestamp() };
  }

  return { timestamp: now() };
}
