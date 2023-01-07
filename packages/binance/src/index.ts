import { Balance, InstrumentSelector, ModuleDefinition } from '@quantform/core';

import { BinanceAdapter } from '@lib/binance-adapter';
import { BinanceConnector } from '@lib/binance-connector';

export * from '@lib/binance-adapter';

export function binance(): ModuleDefinition {
  return {
    dependencies: [
      {
        provide: BinanceConnector,
        useClass: BinanceConnector
      },
      {
        provide: BinanceAdapter,
        useClass: BinanceAdapter
      }
    ]
  };
}

export function useBinanceBalance(instrument: InstrumentSelector): Observable<Balance> {
  const adapter = useBinanceAdapter();
  const store = useBinanceBalanceStore();

  adapter.subscribe(instrument);

  return store.select(it => it);
}
