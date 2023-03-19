import { z } from 'zod';

import { useSignedRequest } from '@lib/use-signed-request';
import { d, decimal, Instrument } from '@quantform/core';

const schema = z.object({ orderId: z.number() });

export function useOrderSettler(order: {
  instrument: Instrument;
  type: 'MARKET' | 'LIMIT';
  quantity: decimal;
  rate?: decimal;
  timeInForce: 'GTC';
}) {
  return useSignedRequest(schema, {
    method: 'POST',
    patch: '/api/v3/order/test',
    query: {
      symbol: order.instrument.raw,
      type: order.type,
      side: order.quantity.greaterThan(d.Zero) ? 'BUY' : 'SELL',
      quantity: order.quantity.abs().toString(),
      price: order.rate?.toString(),
      timeInForce: order.timeInForce
    }
  });
}