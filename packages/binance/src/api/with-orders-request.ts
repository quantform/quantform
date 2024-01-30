import { map } from 'rxjs';
import { z } from 'zod';

import { withSignedRequest } from '@lib/api/with-signed-request';
import { d, useExecutionMode } from '@quantform/core';

import { withSimulator } from './simulator';

const responseType = z.array(
  z.object({
    symbol: z.string(),
    orderId: z.number(),
    clientOrderId: z.string(),
    price: z.string().optional(),
    origQty: z.string(),
    executedQty: z.string(),
    cummulativeQuoteQty: z.string(),
    status: z.enum([
      'NEW',
      'PARTIALLY_FILLED',
      'FILLED',
      'CANCELED',
      'REJECTED',
      'EXPIRED',
      'EXPIRED_IN_MATCH'
    ]),
    timeInForce: z.string(),
    type: z.string(),
    side: z.enum(['BUY', 'SELL']),
    time: z.number()
  })
);

function request(symbol: string) {
  return withSignedRequest({
    method: 'GET',
    patch: '/api/v3/openOrders',
    query: {
      symbol
    }
  }).pipe(
    map(({ timestamp, payload }) => ({
      timestamp,
      payload: responseType.parse(payload)
    }))
  );
}

export function withOrdersRequest(
  ...args: Parameters<typeof request>
): ReturnType<typeof request> {
  const { isSimulation } = useExecutionMode();

  if (!isSimulation) {
    return request(...args);
  }

  return withSimulator().pipe(
    map(({ snapshot }) => {
      const { timestamp, instruments } = snapshot();

      const [symbol] = args;

      return {
        timestamp,
        payload: instruments
          .flatMap(it => it.orders)
          .filter(it => it.instrument.raw === symbol.toLowerCase())
          .map(it => ({
            symbol,
            orderId: it.id,
            clientOrderId: it.clientOrderId,
            price: it.price?.toString(),
            origQty: it.quantity.abs().toString(),
            executedQty: it.executedQuantity.toString(),
            cummulativeQuoteQty: it.cumulativeQuoteQuantity.toString(),
            status: it.status,
            timeInForce: 'GTC',
            type: it.price ? 'LIMIT' : 'MARKET',
            side: it.quantity.gt(d.Zero) ? 'BUY' : 'SELL',
            stopPrice: undefined,
            icebergQty: undefined,
            time: it.timestamp,
            updateTime: it.timestamp,
            isWorking: true
          }))
      };
    })
  );
}
