import { map } from 'rxjs';

import { d, Instrument } from '@quantform/core';

import { withOrdersRequest } from './api';

export function withOrders(instrument: Instrument) {
  return withOrdersRequest(instrument.raw).pipe(
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
  );
}
