import { map, withLatestFrom } from 'rxjs';

import { Binance } from '@quantform/binance';
import {
  d,
  decimal,
  exclude,
  instrumentNotSupported,
  InstrumentSelector
} from '@quantform/core';

import { useOrderExecutionObject } from './use-order-execution-object';

export const useOrderExecutionTrade = (
  id: string,
  instrument: InstrumentSelector,
  rate: decimal
) =>
  Binance.useTrade(instrument).pipe(
    exclude(instrumentNotSupported),
    withLatestFrom(useOrderExecutionObject(id, instrument)),
    map(([trade, execution]) => {
      if (execution.queueQuantityLeft && trade.rate.equals(rate)) {
        execution.timestamp = trade.timestamp;
        execution.queueQuantityLeft = decimal.max(
          execution.queueQuantityLeft.minus(trade.quantity),
          d.Zero
        );
      }

      return execution;
    })
  );
