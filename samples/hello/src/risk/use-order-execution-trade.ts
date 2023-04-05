import { map } from 'rxjs';

import { useBinanceTrade } from '@quantform/binance';
import { d, decimal, exclude, instrumentNotSupported } from '@quantform/core';

import { ExecutionObject } from './use-order-execution-object';

export const useOrderExecutionTrade = (execution: ExecutionObject) =>
  useBinanceTrade(execution.instrument).pipe(
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
