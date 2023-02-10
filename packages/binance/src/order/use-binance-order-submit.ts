import {
  defer,
  distinctUntilChanged,
  filter,
  map,
  merge,
  Observable,
  switchMap,
  takeWhile,
  tap
} from 'rxjs';
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

      const opened = defer(() =>
        setOpened(opened => {
          const timestamp = useTimestamp();

          opened[id] = {
            id,
            timestamp,
            instrument: instrument,
            binanceId: undefined,
            quantity: order.quantity,
            quantityExecuted: d(0),
            rate: order.rate,
            averageExecutionRate: undefined,
            createdAt: timestamp,
            cancelable: false
          };

          return opened;
        })
      );

      const opening = defer(() =>
        useBinanceOrderSubmitCommand({
          instrument,
          quantity: order.quantity,
          rate: order.rate,
          timeInForce: 'GTC',
          type: 'LIMIT'
        }).pipe(
          switchMap(() =>
            setOpened(opened => {
              opened[id].timestamp = useTimestamp();
              opened[id].cancelable = true;

              return opened;
            })
          )
        )
      );

      return merge(opened, opening).pipe(
        map(it => it[id]),
        takeWhile(it => it !== undefined),
        distinctUntilTimestampChanged()
      );
    }
  };
}

export function distinctUntilTimestampChanged<T extends { timestamp: number }>() {
  let prevTimestamp: number | undefined;

  return (stream: Observable<T>) =>
    stream.pipe(
      filter(it => prevTimestamp === undefined || it.timestamp > prevTimestamp),
      tap(it => (prevTimestamp = it.timestamp))
    );
}
