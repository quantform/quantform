import { Dependency, useContext } from '@lib/module';

const injectionToken = Symbol('replay-options');

type ReplayOptions = {
  from: number;
  to: number;
};

/**
 *
 */
export function replayOptions(options: ReplayOptions): Dependency {
  return {
    provide: injectionToken,
    useValue: options
  };
}

/**
 * Will return current replay execution options.
 */
export const useReplayOptions = () => useContext<ReplayOptions>(injectionToken);
