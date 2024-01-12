import { useReplayManager } from '@lib/replay';
import { useExecutionMode } from '@lib/use-execution-mode';

export function useTimestamp() {
  const { isReplay } = useExecutionMode();

  if (isReplay) {
    return useReplayManager().timestamp();
  }

  return Date.now();
}
