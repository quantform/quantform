import { useExecutionMode } from '@lib/use-execution-mode';

export function useReplay<T>(backtest: T, real: T) {
  const { isReplay } = useExecutionMode();

  return isReplay ? backtest : real;
}
