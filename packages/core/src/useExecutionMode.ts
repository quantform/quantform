import { useProvider } from '@lib/module';

export const ExecutionModeToken = 'execution-mode';

export interface IExecutionMode {
  mode: 'TEST' | 'PAPER' | 'LIVE';
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
