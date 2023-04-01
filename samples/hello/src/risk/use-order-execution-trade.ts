import { map } from 'rxjs';

import { Binance } from '@quantform/binance';
import { d, decimal, exclude, instrumentNotSupported } from '@quantform/core';

import { ExecutionObject } from './use-order-execution-object';

export const useOrderExecutionTrade = (execution: ExecutionObject) =>
  Binance.useTrade(execution.instrument).pipe(
    exclude(instrumentNotSupported),
    map(trade => {
      if (execution.queueQuantityLeft && trade.rate.equals(execution.rate)) {
        execution.timestamp = trade.timestamp;
        execution.queueQuantityLeft = decimal.max(
          execution.queueQuantityLeft.minus(trade.quantity),
          d.Zero
        );
      }

      return execution;
    })
  );
