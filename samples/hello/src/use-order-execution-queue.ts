import { tap, withLatestFrom } from 'rxjs';

import { Binance } from '@quantform/binance';
import { d, InstrumentSelector, use } from '@quantform/core';
/*
export const useOrderExecutionQueue = use(
  (id: string, instrument: InstrumentSelector) => {
    const executed = d.Zero;

    return Binance.useOrder(id, instrument).pipe(
      withLatestFrom(Binance.useOrderbookTicker(instrument)),
      tap(([order, orderbook]) => {
      })
    );
  }
);
*/
