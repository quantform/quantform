import { concat, distinctUntilChanged, filter, map, merge, switchMap, take } from 'rxjs';
import { v4 } from 'uuid';

import { d, decimal, Instrument, useTimestamp } from '@quantform/core';

import { useBinanceOpenOrders } from './use-binance-open-orders';
import { useBinanceOrderNewCommand } from './use-binance-order-new-command';

/**
 * Open or close binance spot orders.
 */
export function useBinanceOrderSubmit(instrument: Instrument) {
  const [opened, setOpened] = useBinanceOpenOrders.state(instrument);

  return {
    submit: (order: { quantity: decimal; rate?: decimal }) => {
      const timestamp = useTimestamp();
      const id = v4();

      setOpened(opened => {
        opened[id] = {
          id,
          timestamp,
          instrument: instrument,
          binanceId: undefined,
          quantity: order.quantity,
          quantityExecuted: d(0),
          rate: order.rate,
          averageExecutionRate: undefined,
          createdAt: timestamp
        };

        return opened;
      });

      const p = useBinanceOrderNewCommand({
        instrument,
        quantity: order.quantity,
        rate: order.rate,
        timeInForce: 'GTC',
        type: 'LIMIT'
      })
        .pipe(
          switchMap(() => {
            setOpened(opened => {
              opened[id].timestamp = useTimestamp();

              return opened;
            });

            return opened;
          })
        )
        .pipe(map(it => opened));

      return merge(opened, p).pipe(
        map(it => it[id]),
        filter(it => it !== undefined),
        distinctUntilChanged((lhs, rhs) => lhs.timestamp !== rhs.timestamp)
      );
    }
  };
}
