import { Dependency, useContext } from '@lib/module';

const injectionToken = Symbol('replay-options');

type ReplayOptions = {
  from: number;
  to: number;
  limit?: number;
  storage?: string;
};

/**
 *
 */
export function replayOptions(
  options: Omit<ReplayOptions, 'from' | 'to'> & { from: number; to: number }
): Dependency {
  return {
    provide: injectionToken,
    useValue: {
      storage: 'backtest',
      limit: 10000,
      ...options
    } satisfies ReplayOptions
  };
}

/**
 * Will return current replay execution options.
 */
export const useReplayOptions = () => useContext<ReplayOptions>(injectionToken);
