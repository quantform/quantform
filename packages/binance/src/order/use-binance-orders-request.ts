import { map } from 'rxjs';
import { z } from 'zod';

import { useBinanceSignedRequest } from '@lib/use-binance-signed-request';
import { d, Instrument } from '@quantform/core';

const responseType = z.array(
  z.object({
    symbol: z.string(),
    orderId: z.number(),
    orderListId: z.number(),
    clientOrderId: z.string(),
    price: z.string(),
    origQty: z.string(),
    executedQty: z.string(),
    cummulativeQuoteQty: z.string(),
    status: z.string(),
    timeInForce: z.string(),
    type: z.string(),
    side: z.string(),
    stopPrice: z.string(),
    icebergQty: z.string(),
    time: z.number(),
    updateTime: z.number(),
    isWorking: z.boolean(),
    workingTime: z.number(),
    origQuoteOrderQty: z.string(),
    selfTradePreventionMode: z.string()
  })
);

export function useBinanceOrdersRequest(instrument: Instrument) {
  return useBinanceSignedRequest({
    method: 'GET',
    patch: '/api/v3/openOrders',
    query: {
      symbol: instrument.raw
    }
  }).pipe(
    map(({ timestamp, payload }) => ({
      timestamp,
      payload: responseType.parse(payload)
    })),
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
          averageExecutionRate: d.Zero,
          createdAt: it.time,
          cancelable:
            it.status === 'NEW' ||
            it.status === 'PARTIALLY_FILLED' ||
            it.status === 'TRADE'
        };
      })
    )
  );
}
