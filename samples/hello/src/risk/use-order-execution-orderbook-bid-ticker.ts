import { map } from 'rxjs';

import { Binance } from '@quantform/binance';
import { exclude, instrumentNotSupported } from '@quantform/core';

import { ExecutionObject } from './use-order-execution-object';

export const useOrderExecutionOrderbookBidTicker = (execution: ExecutionObject) =>
  Binance.useOrderbookTicker(execution.instrument).pipe(
    exclude(instrumentNotSupported),
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
