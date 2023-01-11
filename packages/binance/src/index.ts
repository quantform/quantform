import { ModuleDefinition } from '@quantform/core';

import { BinanceConnector } from '@lib/binance-connector';

export * from '@lib/use-binance-asset';
export * from '@lib/use-binance-assets';
export * from '@lib/use-binance-balance';
export * from '@lib/use-binance-balances';
export * from '@lib/use-binance-commission';
export * from '@lib/use-binance-connector';
export * from '@lib/use-binance-instrument';
export * from '@lib/use-binance-instruments';
export * from '@lib/use-binance-orderbook';

export function binance(): ModuleDefinition {
  return {
    dependencies: [
      {
        provide: BinanceConnector,
        useClass: BinanceConnector
      }
    ]
  };
}
