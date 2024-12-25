import { Dependency, useContext } from '@lib/module';

const injectionToken = Symbol('execution-mode');

type ExecutionMode = {
  mode: 'replay' | 'paper' | 'live' | 'idle';
  recording: boolean;
};

export function useExecutionMode() {
  const { mode, recording } = useContext<ExecutionMode>(injectionToken);

  return {
    isReplay: mode === 'replay',
    isPaper: mode === 'paper',
    isLive: mode === 'live',
    isIdle: mode === 'idle',
    isSimulation: mode !== 'live',
    recording
  };
}

useExecutionMode.replayOptions = (): Dependency => ({
  provide: injectionToken,
  useValue: { mode: 'replay', recording: false } as ExecutionMode
});

useExecutionMode.paperOptions = (options: { recording: boolean }): Dependency => ({
  provide: injectionToken,
  useValue: { mode: 'paper', ...options } as ExecutionMode
});

useExecutionMode.liveOptions = (options: { recording: boolean }): Dependency => ({
  provide: injectionToken,
  useValue: { mode: 'live', ...options } as ExecutionMode
});

useExecutionMode.idleOptions = (): Dependency => ({
  provide: injectionToken,
  useValue: { mode: 'idle', recording: false } as ExecutionMode
});
