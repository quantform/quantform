import { useExecutionMode } from '@lib/useExecutionMode';

export function useFake<T>(real: T, fake: T) {
  const mode = useExecutionMode();

  if (mode.simulation) {
    return fake;
  }

  return real;
}
