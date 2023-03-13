import { defer, map, merge, of, switchMap, takeWhile } from 'rxjs';
import { v4 } from 'uuid';

import {
  d,
  decimal,
  distinctUntilTimestampChanged,
  Instrument,
  useTimestamp
} from '@quantform/core';

import { useBinanceOpenOrdersState } from './use-binance-open-orders-state';
import { useBinanceOrderSubmitCommand } from './use-binance-order-submit-command';

/**
 * Open or close binance spot orders.
 */
export function useBinanceOrderSubmit(instrument: Instrument) {
  const [opened$, setOpened] = useBinanceOpenOrdersState(instrument);

  return {
    settle: (order: { quantity: decimal; rate?: decimal }) => {
      const id = v4();

      const opened = setOpened(opened => {
        const timestamp = useTimestamp();

        opened[id] = {
          id,
          timestamp: timestamp,
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
        map(it =>
          setOpened(opened => {
            opened[id].timestamp = useTimestamp();
            opened[id].binanceId = it.orderId;
            opened[id].cancelable = order.rate !== undefined;

            return opened;
          })
        )
      );

      return defer(() => merge(of(opened), opening)).pipe(
        map(it => it[id]),
        takeWhile(it => it !== undefined),
        distinctUntilTimestampChanged()
      );
    },
    cancel: (order: { id: string }) => {
      setOpened(opened => {
        opened[order.id].cancelable = false;

        return opened;
      });

      return defer(() =>
        opened$.pipe(
          map(it => it[order.id]),
          takeWhile(it => it !== undefined),
          distinctUntilTimestampChanged()
        )
      );
    }
  };
}
