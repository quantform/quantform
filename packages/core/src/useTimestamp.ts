import { useBacktesting } from '@lib/useBacktesting';
import { useExecutionMode } from '@lib/useExecutionMode';

export function useTimestamp() {
  const { mode } = useExecutionMode();

  if (mode === 'TEST') {
    const { timestamp } = useBacktesting();

    return timestamp();
  }

  return Date.now();
}
