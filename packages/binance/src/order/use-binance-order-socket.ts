import { filter, map } from 'rxjs';

import { useBinanceUserSocket } from '@lib/user';
import { d, Instrument, useTimestamp } from '@quantform/core';

export const useBinanceOrderSocket = (instrument: Instrument) =>
  useBinanceUserSocket().pipe(
    filter(it => it.payload.e === 'executionReport' && it.payload.s === instrument.raw),
    map(it => {
      if (it.payload.e !== 'executionReport') {
        return undefined;
      }

      const { payload } = it;
      const clientOrderId = payload.C?.length > 0 ? payload.C : payload.c;
      const quantity = d(payload.q);

      return {
        timestamp: useTimestamp(),
        id: clientOrderId,
        binanceId: payload.i,
        instrument,
        quantity: payload.S == 'BUY' ? quantity : quantity.mul(-1),
        createdAt: payload.T,
        rate: payload.p ? d(payload.p) : undefined,
        quantityExecuted: d.Zero,
        averageExecutionRate: d.Zero,
        cancelable:
          payload.x === 'NEW' || payload.x === 'PARTIALLY_FILLED' || payload.x === 'TRADE'
      };
    })
  );
