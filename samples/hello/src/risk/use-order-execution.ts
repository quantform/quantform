import { combineLatest, defer, finalize, merge, takeWhile, tap } from 'rxjs';

import { Binance } from '@quantform/binance';
import { orderNotFound } from '@quantform/binance/dist/order';
import {
  decimal,
  distinctUntilTimestampChanged,
  InstrumentSelector,
  useLogger
} from '@quantform/core';

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

    return combineLatest([
      Binance.useOrder(id, instrument),
      merge(
        useOrderExecutionTrade(id, instrument, rate),
        useOrderExecutionOrderbookBidDepth(id, instrument, rate),
        useOrderExecutionOrderbookBidTicker(id, instrument, rate)
      ).pipe(
        distinctUntilTimestampChanged(),
        tap(it => debug(`updated execution of order ${id} to ${it.queueQuantityLeft}`))
      )
    ]).pipe(
      takeWhile(([it]) => it !== orderNotFound && it.cancelable),
      finalize(() => debug(`stopped tracking the execution of order ${id}`))
    );
  });
};
