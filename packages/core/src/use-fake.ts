import { useExecutionMode } from '@lib/use-execution-mode';

export function useFake<T>(real: T, fake: T) {
  const mode = useExecutionMode();

  switch (mode.mode) {
    case 'PAPER':
    case 'REPLAY':
      return fake;
    case 'LIVE':
      return real;
  }
}
