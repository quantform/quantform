import { combineLatest, defer, finalize, merge, switchMap, takeWhile, tap } from 'rxjs';

import { Binance } from '@quantform/binance';
import { orderNotFound } from '@quantform/binance/dist/order';
import {
  decimal,
  distinctUntilTimestampChanged,
  InstrumentSelector,
  useLogger
} from '@quantform/core';

import { useOrderExecutionObject } from './use-order-execution-object';
import { useOrderExecutionOrderbookBidDepth } from './use-order-execution-orderbook-bid-depth';
import { useOrderExecutionOrderbookBidTicker } from './use-order-execution-orderbook-bid-ticker';
import { useOrderExecutionTrade } from './use-order-execution-trade';

export const useOrderExecution = (
  id: string,
  instrument: InstrumentSelector,
  rate: decimal
) => {
  const { debug } = useLogger('useOrderExecution');

  return defer(() => {
    debug(`started tracking the execution of order ${id}`);

    return useOrderExecutionObject(id, instrument, rate).pipe(
      switchMap(([execution, save]) =>
        combineLatest([
          Binance.useOrder(id, instrument),
          merge(
            useOrderExecutionTrade(execution),
            useOrderExecutionOrderbookBidDepth(execution),
            useOrderExecutionOrderbookBidTicker(execution)
          ).pipe(
            distinctUntilTimestampChanged(),
            tap(save),
            tap(it =>
              debug(`updated execution of order ${id} to ${it.queueQuantityLeft}`)
            )
          )
        ]).pipe(
          takeWhile(([it]) => it !== orderNotFound && it.cancelable),
          finalize(() => debug(`stopped tracking the execution of order ${id}`))
        )
      )
    );
  });
};
