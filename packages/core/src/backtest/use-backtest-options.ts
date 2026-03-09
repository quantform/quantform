import { Dependency, useContext } from '@lib/module';

const injectionToken = Symbol('backtest-options');

type BacktestOptions = {
  from: number;
  to: number;
};

/**
 *
 */
export function backtestOptions(options: BacktestOptions): Dependency {
  return {
    provide: injectionToken,
    useValue: options
  };
}

/**
 * Will return current backtest execution options.
 */
export const useBacktestOptions = () => useContext<BacktestOptions>(injectionToken);
