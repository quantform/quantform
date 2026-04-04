import { Dependency, useContext } from '@lib/module';
import { Timestamp } from '@lib/use-timestamp';

const injectionToken = Symbol('replay-options');

type ReplayOptions = {
  from: Timestamp<'ns'>;
  to: Timestamp<'ns'>;
  limit?: number;
  storage?: string;
};

/**
 *
 */
export function replayOptions(
  options: Omit<ReplayOptions, 'from' | 'to'> & {
    from: Timestamp<'ns'>;
    to: Timestamp<'ns'>;
  }
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
