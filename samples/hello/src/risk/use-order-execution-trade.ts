import { map, withLatestFrom } from 'rxjs';

import { Binance } from '@quantform/binance';
import { decimal, instrumentNotSupported, InstrumentSelector } from '@quantform/core';

import { useOrderExecutionObject } from './use-order-execution-object';

export const useOrderExecutionTrade = (
  id: string,
  instrument: InstrumentSelector,
  rate: decimal
) =>
  Binance.useTrade(instrument).pipe(
    withLatestFrom(useOrderExecutionObject(id, instrument)),
    map(([trade, execution]) => {
      if (
        trade !== instrumentNotSupported &&
        execution.queueQuantityLeft /* && trade.rate.equals(rate)*/
      ) {
        execution.timestamp = trade.timestamp;
        execution.queueQuantityLeft = decimal.max(
          execution.queueQuantityLeft.minus(trade.quantity)
          //  d.Zero
        );
      }

      return execution;
    })
  );
