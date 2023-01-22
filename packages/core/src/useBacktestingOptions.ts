import { Dependency, useProvider } from '@lib/module';

const BacktestingOptionsToken = Symbol('backtesting-options');

type BacktestingOptions = {
  from: number;
  to: number;
};

export function withBacktestingOptions(options: BacktestingOptions): Dependency {
  return {
    provide: BacktestingOptionsToken,
    useValue: options
  };
}

export function useBacktestingOptions() {
  return useProvider<BacktestingOptions>(BacktestingOptionsToken);
}
