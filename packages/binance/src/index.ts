import { ModuleDefinition } from '@quantform/core';

import { BinanceConnector } from '@lib/binance-connector';
import { BinanceOptions } from '@lib/binance-options';

export * from '@lib/use-binance-asset';
export * from '@lib/use-binance-assets';
export * from '@lib/use-binance-balance';
export * from '@lib/use-binance-balances';
export * from '@lib/use-binance-commission';
export * from '@lib/use-binance-connector';
export * from '@lib/use-binance-instrument';
export * from '@lib/use-binance-instruments';
export * from '@lib/use-binance-orderbook';
export * from '@lib/use-binance-orders';

export function withBinance(options: BinanceOptions): ModuleDefinition {
  return {
    dependencies: [
      {
        provide: BinanceConnector,
        useClass: BinanceConnector
      },
      {
        provide: BinanceOptions,
        useValue: options
      }
    ]
  };
}
