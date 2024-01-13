import { useContext } from '@lib/module';

const injectionToken = Symbol('execution-mode');

type ExecutionMode = {
  mode: 'replay' | 'paper' | 'live';
  recording: boolean;
};

export function replayExecutionMode() {
  return {
    provide: injectionToken,
    useValue: { mode: 'replay', recording: false } as ExecutionMode
  };
}

export function paperExecutionMode(options: { recording: boolean }) {
  return {
    provide: injectionToken,
    useValue: { mode: 'paper', ...options } as ExecutionMode
  };
}

export function liveExecutionMode(options: { recording: boolean }) {
  return {
    provide: injectionToken,
    useValue: { mode: 'live', ...options } as ExecutionMode
  };
}

export const useExecutionMode = () => {
  const mode = useContext<ExecutionMode>(injectionToken);

  return {
    isReplay: mode.mode === 'replay',
    isPaper: mode.mode === 'paper',
    isLive: mode.mode === 'live',
    isSimulation: mode.mode !== 'live',
    recording: mode.recording
  };
};
