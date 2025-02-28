import { map, switchMap } from 'rxjs';

import { getOrdersRequest } from '@lib/api';
import { getInstrument } from '@lib/instrument/get-instrument';
import { d, InstrumentSelector } from '@quantform/core';

export function getOrders(selector: InstrumentSelector) {
  return getInstrument(selector).pipe(
    switchMap(instrument =>
      getOrdersRequest(instrument.raw).pipe(
        map(({ timestamp, payload }) =>
          payload.map(it => {
            const quantity = d(it.origQty);

            return {
              timestamp,
              id: it.clientOrderId,
              binanceId: it.orderId,
              instrument: instrument,
              rate: it.price ? d(it.price) : undefined,
              quantity: it.side == 'BUY' ? quantity : quantity.mul(-1),
              quantityExecuted: d(it.executedQty),
              side: it.side == 'BUY' ? 'BUY' : 'SELL',
              averageExecutionRate: d.Zero,
              createdAt: it.time,
              status: it.status
            };
          })
        )
      )
    )
  );
}
