import { map } from 'rxjs';
import { z } from 'zod';

import { withSignedRequest } from '@lib/with-signed-request';
import { d, decimal, Instrument } from '@quantform/core';

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

export function withOrderNew(order: {
  instrument: Instrument;
  type: 'MARKET' | 'LIMIT';
  quantity: decimal;
  rate?: decimal;
  timeInForce: 'GTC';
  id?: string;
}) {
  return withSignedRequest({
    method: 'POST',
    patch: '/api/v3/order',
    query: {
      symbol: order.instrument.raw,
      type: order.type,
      side: order.quantity.greaterThan(d.Zero) ? 'BUY' : 'SELL',
      quantity: order.instrument.base.fixed(order.quantity.abs()),
      price: order.rate ? order.instrument.quote.fixed(order.rate) : undefined,
      timeInForce: order.timeInForce,
      newClientOrderId: order.id
    }
  }).pipe(
    map(({ timestamp, payload }) => ({ timestamp, payload: responseType.parse(payload) }))
  );
}
