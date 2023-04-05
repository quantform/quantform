import { map } from 'rxjs';

import { useBinanceOrderbookDepth } from '@quantform/binance';
import { exclude, notFound } from '@quantform/core';

import { ExecutionObject } from './use-order-execution-object';

export const useOrderExecutionOrderbookBidDepth = (execution: ExecutionObject) =>
  useBinanceOrderbookDepth(execution.instrument, '5@100ms').pipe(
    exclude(notFound),
    map(depth => {
      if (!execution.queueQuantityLeft) {
        const quantity = depth.bids.find(it => it.rate.eq(execution.rate))?.quantity;

        if (quantity) {
          execution.timestamp = depth.timestamp;
          execution.queueQuantityLeft = quantity;
        }
      }

      if (execution.queueQuantityLeft /* && trade.rate.equals(rate)*/) {
      }

      return execution;
    })
  );
