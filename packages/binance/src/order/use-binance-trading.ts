import { map, take } from 'rxjs';
import { v4 } from 'uuid';

import { d, decimal, Instrument, useTimestamp } from '@quantform/core';

import { useBinanceOpenOrders } from './use-binance-open-orders';

export function useBinanceTrading(instrument: Instrument) {
  const [orders, setOrders] = useBinanceOpenOrders.state(instrument);

  return orders.pipe(
    take(1),
    map(snapshot => ({
      open: (order: { quantity: decimal; rate?: decimal }) => {
        const timestamp = useTimestamp();

        const newOrder = {
          id: v4(),
          timestamp,
          instrument: instrument,
          binanceId: undefined,
          quantity: order.quantity,
          quantityExecuted: d(0),
          rate: order.rate,
          averageExecutionRate: undefined,
          createdAt: timestamp
        };

        snapshot[newOrder.id] = newOrder;

        setOrders(snapshot);
      }
    }))
  );
}
