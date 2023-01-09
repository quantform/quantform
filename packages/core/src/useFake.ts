import { useProvider } from '@lib/module';

export const ExecutionModeToken = 'execution-mode';

export interface IExecutionMode {
  isReal(): boolean;
}

export function withFake<T>(real: () => T, fake: () => T) {
  const executionMode = useProvider<IExecutionMode>(ExecutionModeToken);

  if (executionMode.isReal()) {
    return real();
  }

  return fake();
}
