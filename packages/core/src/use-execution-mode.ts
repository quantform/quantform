import { useContext } from '@lib/module';

export const ExecutionModeToken = 'execution-mode';

export interface IExecutionMode {
  mode: 'REPLAY' | 'PAPER' | 'LIVE';
  recording: boolean;
}

export function useExecutionMode() {
  return useContext<IExecutionMode>(ExecutionModeToken);
}

export function withExecutionReplay() {
  return {
    provide: ExecutionModeToken,
    useValue: { mode: 'REPLAY', recording: false } as IExecutionMode
  };
}

export function withExecutionPaper(options: { recording: boolean }) {
  return {
    provide: ExecutionModeToken,
    useValue: { mode: 'PAPER', ...options } as IExecutionMode
  };
}

export function withExecutionLive(options: { recording: boolean }) {
  return {
    provide: ExecutionModeToken,
    useValue: { mode: 'LIVE', ...options } as IExecutionMode
  };
}
