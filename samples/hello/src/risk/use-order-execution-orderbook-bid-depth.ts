import { finalize, map, withLatestFrom } from 'rxjs';

import { Binance } from '@quantform/binance';
import {
  decimal,
  exclude,
  instrumentNotSupported,
  InstrumentSelector
} from '@quantform/core';

import { useOrderExecutionObject } from './use-order-execution-object';

export const useOrderExecutionOrderbookBidDepth = (
  id: string,
  instrument: InstrumentSelector,
  rate: decimal
) =>
  Binance.useOrderbookDepth(instrument, '5@100ms').pipe(
    exclude(instrumentNotSupported),
    withLatestFrom(useOrderExecutionObject(id, instrument)),
    map(([depth, execution]) => {
      if (rate /* && trade.rate.equals(rate)*/) {
      }

      return execution;
    }),
    finalize(() => console.log('NOO'))
  );
