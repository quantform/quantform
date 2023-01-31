import { BinanceConnector } from '@lib/binance-connector';
import { Dependency } from '@quantform/core';

import { BinanceOptions } from './use-binance-options';

export * from './asset';
export * from './balance';
export * from './commission';
export * from './instrument';
export * from './trade';
export * from './order';
export * from './orderbook';

export function withBinance(options: Partial<BinanceOptions>): Dependency[] {
  return [
    {
      provide: BinanceConnector,
      useClass: BinanceConnector
    },
    {
      provide: BinanceOptions,
      useValue: { ...new BinanceOptions(), ...options }
    }
  ];
}
