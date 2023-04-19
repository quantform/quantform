import { useContext } from '@lib/module';

const injectionToken = Symbol('execution-mode');

type ExecutionMode = {
  mode: 'REPLAY' | 'PAPER' | 'LIVE';
  recording: boolean;
};

export function replayExecutionMode() {
  return {
    provide: injectionToken,
    useValue: { mode: 'REPLAY', recording: false } as ExecutionMode
  };
}

export function paperExecutionMode(options: { recording: boolean }) {
  return {
    provide: injectionToken,
    useValue: { mode: 'PAPER', ...options } as ExecutionMode
  };
}

export function liveExecutionMode(options: { recording: boolean }) {
  return {
    provide: injectionToken,
    useValue: { mode: 'LIVE', ...options } as ExecutionMode
  };
}

export const useExecutionMode = () => {
  const mode = useContext<ExecutionMode>(injectionToken);

  return {
    isReplay: mode.mode === 'REPLAY',
    isPaper: mode.mode === 'PAPER',
    isLive: mode.mode === 'LIVE',
    isSimulation: mode.mode !== 'LIVE',
    recording: mode.recording
  };
};
