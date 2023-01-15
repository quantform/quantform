import { useExecutionMode } from '@lib/useExecutionMode';

export function useFake<T>(real: T, fake: T) {
  const { isReal } = useExecutionMode();

  if (isReal) {
    return real;
  }

  return fake;
}
