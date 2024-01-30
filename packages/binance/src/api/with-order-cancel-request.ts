import { map } from 'rxjs';
import { z } from 'zod';

import { withSignedRequest } from '@lib/api/with-signed-request';
import { d, useExecutionMode, useTimestamp } from '@quantform/core';

import { withSimulator } from './simulator';

const responseType = z.object({
  symbol: z.string(),
  origClientOrderId: z.string(),
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
  side: z.string()
});

function request(query: {
  symbol: string;
  orderId?: number;
  origClientOrderId?: string;
}) {
  return withSignedRequest({
    method: 'DELETE',
    patch: '/api/v3/order',
    query
  }).pipe(
    map(response => ({
      timestamp: useTimestamp(),
      payload: responseType.parse(response)
    }))
  );
}

export function withOrderCancelRequest(
  ...args: Parameters<typeof request>
): ReturnType<typeof request> {
  const { isSimulation } = useExecutionMode();

  if (!isSimulation) {
    return request(...args);
  }

  return withSimulator().pipe(
    map(({ apply }) =>
      apply(simulator => {
        const [{ symbol, orderId, origClientOrderId }] = args;

        const order = simulator.orderCancel({
          symbol,
          id: orderId,
          customId: origClientOrderId
        });

        const { timestamp } = simulator.snapshot();

        return {
          timestamp,
          payload: {
            symbol,
            orderId: order.id,
            origClientOrderId: order.clientOrderId,
            clientOrderId: order.clientOrderId,
            price: order.price?.toString(),
            origQty: order.quantity.toString(),
            executedQty: order.executedQuantity.toString(),
            cummulativeQuoteQty: order.cumulativeQuoteQuantity.toString(),
            status: order.status,
            timeInForce: 'GTC',
            type: order.price ? 'LIMIT' : 'MARKET',
            side: order.quantity.gt(d.Zero) ? 'BUY' : 'SELL'
          }
        };
      })
    )
  );
}
