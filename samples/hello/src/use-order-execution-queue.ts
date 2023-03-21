import { distinctUntilChanged, map, withLatestFrom } from 'rxjs';

import { Binance } from '@quantform/binance';
import { orderNotFound } from '@quantform/binance/dist/order';
import { d, instrumentNotSupported, InstrumentSelector, use } from '@quantform/core';

export const useOrderExecutionQueue = use(
  (id: string, instrument: InstrumentSelector) => {
    let executed = d.Zero;

    return Binance.useOrder(id, instrument).pipe(
      withLatestFrom(Binance.useTrade(instrument)),
      map(([order, trade]) => {
        if (
          order === orderNotFound ||
          trade === instrumentNotSupported ||
          trade.rate !== order.rate
        ) {
          return executed;
        }

        executed = executed.plus(order.quantity);

        return executed;
      }),
      distinctUntilChanged()
    );
  }
);
