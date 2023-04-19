import { useReplayCoordinator } from '@lib/replay/use-replay-coordinator';
import { useExecutionMode } from '@lib/use-execution-mode';

export function useTimestamp() {
  const { isReplay } = useExecutionMode();

  if (isReplay) {
    return useReplayCoordinator().timestamp();
  }

  return Date.now();
}
