import { useExecutionMode } from '@lib/useExecutionMode';

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
