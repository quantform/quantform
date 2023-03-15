import { useReplayCoordinator } from '@lib/replay/use-replay-coordinator';
import { useExecutionMode } from '@lib/use-execution-mode';

export function useTimestamp() {
  const { mode } = useExecutionMode();

  if (mode === 'REPLAY') {
    return useReplayCoordinator().timestamp();
  }

  return Date.now();
}
