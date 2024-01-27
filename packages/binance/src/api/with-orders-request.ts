import { map } from 'rxjs';
import { z } from 'zod';

import { withSignedRequest } from '@lib/api/with-signed-request';
import { useExecutionMode } from '@quantform/core';

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
    map(({ apply }) => apply(simulator => simulator.withOrders(args)))
  );
}
