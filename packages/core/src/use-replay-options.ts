import { Dependency, useContext } from '@lib/module';

const ReplayOptionsToken = Symbol('replay-options');

type ReplayOptions = {
  from: number;
  to: number;
};

export function withReplayOptions(options: ReplayOptions): Dependency {
  return {
    provide: ReplayOptionsToken,
    useValue: options
  };
}

export function useReplayOptions() {
  return useContext<ReplayOptions>(ReplayOptionsToken);
}
