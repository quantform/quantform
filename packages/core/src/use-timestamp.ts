import { useExecutionMode } from '@lib/use-execution-mode';
import { useReplayController } from '@lib/use-replay-controller';

export function useTimestamp() {
  const { mode } = useExecutionMode();

  if (mode === 'REPLAY') {
    return useReplayController();
  }

  return { timestamp: () => Date.now() };
}
