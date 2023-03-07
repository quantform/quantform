import { useExecutionMode } from '@lib/use-execution-mode';

export function useSimulator<T>(real: T, simulator: T) {
  const mode = useExecutionMode();

  switch (mode.mode) {
    case 'PAPER':
    case 'REPLAY':
      return simulator;
    case 'LIVE':
      return real;
  }
}
