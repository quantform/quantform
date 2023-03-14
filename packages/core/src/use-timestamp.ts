import { useExecutionMode } from '@lib/use-execution-mode';
import { useReplayController } from '@lib/replay/use-replay-controller';

export function useTimestamp() {
  const { mode } = useExecutionMode();

  if (mode === 'REPLAY') {
    return useReplayController().timestamp();
  }

  return Date.now();
}
