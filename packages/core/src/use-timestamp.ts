import { useExecutionMode } from '@lib/use-execution-mode';
import { useReplayController } from '@lib/use-replay-controller';

export function useTimestamp() {
  const { mode } = useExecutionMode();

  if (mode === 'REPLAY') {
    const { timestamp } = useReplayController();

    return timestamp();
  }

  return Date.now();
}
