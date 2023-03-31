import { filter, map } from 'rxjs';

import { useUserSocket } from '@lib/user';
import { connected, d, disconnected, Instrument, useTimestamp } from '@quantform/core';

import { useOrdersState } from './use-orders-state';

export const useOrdersChanges = (instrument: Instrument) => {
  const [, setOpened] = useOrdersState(instrument);

  return useUserSocket().pipe(
    filter(
      it =>
        it !== connected &&
        it !== disconnected &&
        it.payload.e === 'executionReport' &&
        it.payload.s === instrument.raw
    ),
    map(it => {
      if (it === connected || it === disconnected || it.payload.e !== 'executionReport') {
        return {};
      }

      const { payload } = it;

      return setOpened(opened => {
        const clientOrderId = payload.C?.length > 0 ? payload.C : payload.c;

        let order = opened[clientOrderId];

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
      });
    })
  );
};
