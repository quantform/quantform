import { useExecutionMode } from '@lib/use-execution-mode';

export function useSimulator<T>(simulator: T, real: T) {
  const { isSimulation } = useExecutionMode();

  return isSimulation ? simulator : real;
}
