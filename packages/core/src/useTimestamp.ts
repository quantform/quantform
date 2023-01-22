import { useExecutionMode } from '@lib/useExecutionMode';
import { useReplayController } from '@lib/useReplayController';

export function useTimestamp() {
  const { mode } = useExecutionMode();

  if (mode === 'REPLAY') {
    const { timestamp } = useReplayController();

    return timestamp();
  }

  return Date.now();
}
