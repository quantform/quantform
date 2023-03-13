import { filter, map } from 'rxjs';

import { useBinanceUserSocket } from '@lib/use-binance-user-socket';
import { d, Instrument, useTimestamp } from '@quantform/core';

import { BinanceOrder, useBinanceOpenOrdersState } from './use-binance-open-orders-state';

export const useBinanceOpenOrdersSocket = (instrument: Instrument) => {
  const [, setOpened] = useBinanceOpenOrdersState(instrument);

  return useBinanceUserSocket().pipe(
    filter(it => it.payload.e === 'executionReport' && it.payload.s === instrument.raw),
    map(it =>
      setOpened(opened => {
        const { payload } = it;
        const clientOrderId = payload.C?.length > 0 ? payload.C : payload.c;

        let order: BinanceOrder = opened[clientOrderId];

        if (!order) {
          const quantity = d(payload.q);

          order = {
            id: clientOrderId,
            binanceId: payload.i,
            instrument,
            quantity: payload.S == 'BUY' ? quantity : quantity.mul(-1),
            createdAt: payload.T,
            rate: payload.p ? d(payload.p) : undefined,
            timestamp: useTimestamp(),
            quantityExecuted: d.Zero,
            averageExecutionRate: d.Zero,
            cancelable: false
          };

          opened[clientOrderId] = order;
        }

        order.timestamp = useTimestamp();
        order.cancelable =
          payload.x === 'NEW' ||
          payload.x === 'PARTIALLY_FILLED' ||
          payload.x === 'TRADE';

        return opened;
      })
    )
  );
};
