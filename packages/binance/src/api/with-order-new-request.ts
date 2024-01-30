import { map } from 'rxjs';
import { z } from 'zod';

import { d, useExecutionMode } from '@quantform/core';

import { withSimulator } from './simulator/with-simulator';
import { withSignedRequest } from './with-signed-request';

const responseType = z.object({
  orderId: z.number(),
  status: z.enum([
    'NEW',
    'PARTIALLY_FILLED',
    'FILLED',
    'CANCELED',
    'REJECTED',
    'EXPIRED',
    'EXPIRED_IN_MATCH'
  ])
});

function request(order: {
  symbol: string;
  type: 'MARKET' | 'LIMIT';
  side: 'BUY' | 'SELL';
  quantity: string;
  price?: string;
  timeInForce: 'GTC';
  newClientOrderId?: string;
}) {
  return withSignedRequest({
    method: 'POST',
    patch: '/api/v3/order',
    query: order
  }).pipe(
    map(({ timestamp, payload }) => ({ timestamp, payload: responseType.parse(payload) }))
  );
}

export function withOrderNewRequest(
  ...args: Parameters<typeof request>
): ReturnType<typeof request> {
  const { isSimulation } = useExecutionMode();

  if (!isSimulation) {
    return request(...args);
  }

  return withSimulator().pipe(
    map(({ apply }) =>
      apply(simulator => {
        const [order] = args;

        const newOrder = simulator.orderNew({
          symbol: order.symbol,
          quantity: order.side === 'BUY' ? d(order.quantity) : d(order.quantity).neg(),
          price: order.price ? d(order.price) : undefined,
          customId: order.newClientOrderId
        });

        const { timestamp } = simulator.snapshot();

        return {
          timestamp,
          payload: {
            orderId: newOrder.id,
            status: newOrder.status
          }
        };
      })
    )
  );
}
