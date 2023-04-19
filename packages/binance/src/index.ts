import { Dependency } from '@quantform/core';

import { BinanceOptions, options } from './use-binance-options';

export * from './asset';
export * from './balance';
export * from './commission';
export * from './instrument';
export * from './order';
export * from './orderbook';
export * from './trade';
export * from './use-binance-options';

export function binance(opts: Partial<BinanceOptions>): Dependency[] {
  return [options(opts)];
}
