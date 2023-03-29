import { finalize, map, withLatestFrom } from 'rxjs';

import { Binance } from '@quantform/binance';
import { decimal, instrumentNotSupported, InstrumentSelector } from '@quantform/core';

import { useOrderExecutionObject } from './use-order-execution-object';

export const useOrderExecutionOrderbookBidDepth = (
  id: string,
  instrument: InstrumentSelector,
  rate: decimal
) =>
  Binance.useOrderbookDepth(instrument, '5@100ms').pipe(
    withLatestFrom(useOrderExecutionObject(id, instrument)),
    map(([depth, execution]) => {
      if (depth !== instrumentNotSupported && rate /* && trade.rate.equals(rate)*/) {
      }

      return execution;
    }),
    finalize(() => console.log('NOO'))
  );
