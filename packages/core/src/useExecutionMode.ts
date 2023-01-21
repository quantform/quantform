import { useProvider } from '@lib/module';

export const ExecutionModeToken = 'execution-mode';

export interface IExecutionMode {
  simulation: boolean;
  recording: boolean;
}

export function withExecutionMode(options: IExecutionMode) {
  return {
    provide: ExecutionModeToken,
    useValue: options
  };
}

export function useExecutionMode() {
  return useProvider<IExecutionMode>(ExecutionModeToken);
}
