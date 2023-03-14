import { useContext } from '@lib/module';

export const ExecutionModeToken = 'execution-mode';

export interface IExecutionMode {
  mode: 'REPLAY' | 'PAPER' | 'LIVE';
  recording: boolean;
}

export function useExecutionMode() {
  return useContext<IExecutionMode>(ExecutionModeToken);
}

export function replayExecutionMode() {
  return {
    provide: ExecutionModeToken,
    useValue: { mode: 'REPLAY', recording: false } as IExecutionMode
  };
}

export function paperExecutionMode(options: { recording: boolean }) {
  return {
    provide: ExecutionModeToken,
    useValue: { mode: 'PAPER', ...options } as IExecutionMode
  };
}

export function liveExecutionMode(options: { recording: boolean }) {
  return {
    provide: ExecutionModeToken,
    useValue: { mode: 'LIVE', ...options } as IExecutionMode
  };
}
