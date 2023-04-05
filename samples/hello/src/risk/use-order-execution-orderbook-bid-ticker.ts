import { map } from 'rxjs';

import { useBinanceOrderbookTicker } from '@quantform/binance';
import { exclude, notFound } from '@quantform/core';

import { ExecutionObject } from './use-order-execution-object';

export const useOrderExecutionOrderbookBidTicker = (execution: ExecutionObject) =>
  useBinanceOrderbookTicker(execution.instrument).pipe(
    exclude(notFound),
    map(ticker => {
      if (execution.queueQuantityLeft && ticker.bids.rate.equals(execution.rate)) {
        if (execution.queueQuantityLeft.gt(ticker.bids.quantity)) {
          execution.timestamp = ticker.timestamp;
          execution.queueQuantityLeft = ticker.bids.quantity;
        }
      }

      return execution;
    })
  );
