import { Dependency } from '@quantform/core';

import { BinanceOptions } from './use-binance-options';
export * from './balance';
export * from './commission';
export * from './instrument';
export * from './trade';
export * from './order';
export * from './orderbook';

export function binance(options: Partial<BinanceOptions>): Dependency[] {
  return [
    {
      provide: BinanceOptions,
      useValue: { ...new BinanceOptions(), ...options }
    }
  ];
}
