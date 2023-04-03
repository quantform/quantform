import { z } from 'zod';

import { useSignedRequest } from '@lib/use-signed-request';
import { d, decimal, Instrument } from '@quantform/core';

const schema = z.object({ orderId: z.number() });

export function useOrderOpenRequest(order: {
  instrument: Instrument;
  type: 'MARKET' | 'LIMIT';
  quantity: decimal;
  rate?: decimal;
  timeInForce: 'GTC';
}) {
  return useSignedRequest(schema, {
    method: 'POST',
    patch: '/api/v3/order',
    query: {
      symbol: order.instrument.raw,
      type: order.type,
      side: order.quantity.greaterThan(d.Zero) ? 'BUY' : 'SELL',
      quantity: order.instrument.base.fixed(order.quantity),
      price: order.rate ? order.instrument.quote.fixed(order.rate) : undefined,
      timeInForce: order.timeInForce
    }
  });
}
