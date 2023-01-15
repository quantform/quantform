import { useProvider } from '@lib/module';

export const ExecutionModeToken = 'execution-mode';

export interface IExecutionMode {
  isReal(): boolean;
}

export function withExecutionMode(isReal: boolean) {
  return {
    provide: ExecutionModeToken,
    useValue: { isReal: () => isReal }
  };
}

export function useExecutionMode() {
  const executionMode = useProvider<IExecutionMode>(ExecutionModeToken);

  return {
    isReal: executionMode.isReal()
  };
}
