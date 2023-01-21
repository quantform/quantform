import { Dependency } from '@quantform/core';

import { BinanceConnector } from '@lib/binance-connector';
import { BinanceOptions } from '@lib/binance-options';

export * from './asset';
export * from './balance';
export * from './commission';
export * from './instrument';
export * from './trade';
export * from './order';
export * from './orderbook';

export function withBinance(options: BinanceOptions): Dependency[] {
  return [
    {
      provide: BinanceConnector,
      useClass: BinanceConnector
    },
    {
      provide: BinanceOptions,
      useValue: options
    }
  ];
}
