import { useContext } from '@lib/module';

const injectionToken = Symbol('execution-mode');

type ExecutionMode = {
  mode: 'replay' | 'paper' | 'live' | 'idle';
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

export function idleExecutionMode() {
  return {
    provide: injectionToken,
    useValue: { mode: 'idle', recording: false } as ExecutionMode
  };
}

export const useExecutionMode = () => {
  const { mode, recording } = useContext<ExecutionMode>(injectionToken);

  return {
    isReplay: mode === 'replay',
    isPaper: mode === 'paper',
    isLive: mode === 'live',
    isIdle: mode === 'idle',
    isSimulation: mode !== 'live',
    recording
  };
};
