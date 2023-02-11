import { defer, filter, map, merge, Observable, switchMap, takeWhile, tap } from 'rxjs';
import { v4 } from 'uuid';

import { d, decimal, Instrument, useTimestamp } from '@quantform/core';

import { useBinanceOpenOrders } from './use-binance-open-orders';
import { useBinanceOrderSubmitCommand } from './use-binance-order-submit-command';

/**
 * Open or close binance spot orders.
 */
export function useBinanceOrderSubmit(instrument: Instrument) {
  const [, setOpened] = useBinanceOpenOrders.state(instrument);

  return {
    submit: (order: { quantity: decimal; rate?: decimal }) => {
      const id = v4();

      const opened = setOpened(opened => {
        const timestamp = useTimestamp();

        opened[id] = {
          id,
          timestamp,
          instrument: instrument,
          binanceId: undefined,
          quantityExecuted: d(0),
          averageExecutionRate: undefined,
          createdAt: timestamp,
          cancelable: false,
          ...order
        };

        return opened;
      });

      const opening = useBinanceOrderSubmitCommand({
        instrument,
        type: order.rate ? 'LIMIT' : 'MARKET',
        timeInForce: 'GTC',
        ...order
      }).pipe(
        switchMap(it =>
          setOpened(opened => {
            opened[id].timestamp = useTimestamp();
            opened[id].binanceId = it.orderId;
            opened[id].cancelable = order.rate !== undefined;

            return opened;
          })
        )
      );

      return defer(() => merge(opened, opening)).pipe(
        map(it => it[id]),
        takeWhile(it => it !== undefined),
        distinctUntilTimestamped()
      );
    },
    cancel: (order: { id: string }) => {
      const canceling = setOpened(opened => {
        opened[order.id].cancelable = false;

        return opened;
      });

      return defer(() =>
        canceling.pipe(
          map(it => it[order.id]),
          takeWhile(it => it !== undefined),
          distinctUntilTimestamped()
        )
      );
    }
  };
}

export function distinctUntilTimestamped<T extends { timestamp: number }>() {
  let prevTimestamp: number | undefined;

  return (stream: Observable<T>) =>
    stream.pipe(
      filter(it => prevTimestamp === undefined || it.timestamp > prevTimestamp),
      tap(it => (prevTimestamp = it.timestamp))
    );
}
