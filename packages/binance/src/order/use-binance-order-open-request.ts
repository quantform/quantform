import { map } from 'rxjs';
import { z } from 'zod';

import { withSignedRequest } from '@lib/with-signed-request';
import { d, decimal, Instrument } from '@quantform/core';

const responseType = z.object({ orderId: z.number() });

export function useBinanceOrderOpenRequest(order: {
  instrument: Instrument;
  type: 'MARKET' | 'LIMIT';
  quantity: decimal;
  rate?: decimal;
  timeInForce: 'GTC';
}) {
  return withSignedRequest({
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
  }).pipe(
    map(({ timestamp, payload }) => ({ timestamp, payload: responseType.parse(payload) }))
  );
}
