import { map, withLatestFrom } from 'rxjs';

import { Binance } from '@quantform/binance';
import {
  decimal,
  exclude,
  instrumentNotSupported,
  InstrumentSelector
} from '@quantform/core';

import { useOrderExecutionObject } from './use-order-execution-object';

export const useOrderExecutionOrderbookBidTicker = (
  id: string,
  instrument: InstrumentSelector,
  rate: decimal
) =>
  Binance.useOrderbookTicker(instrument).pipe(
    exclude(instrumentNotSupported),
    withLatestFrom(useOrderExecutionObject(id, instrument)),
    map(([ticker, execution]) => {
      if (execution.queueQuantityLeft) {
        if (ticker.bids.rate.equals(rate)) {
          execution.timestamp = ticker.timestamp;
          execution.queueQuantityLeft = decimal.min(
            execution.queueQuantityLeft,
            ticker.bids.quantity
          );
        }
      }

      return execution;
    })
  );
