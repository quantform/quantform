import { map } from 'rxjs';
import { v4 } from 'uuid';
import { z } from 'zod';

import { withSimulator } from '@lib/simulator';
import { withSignedRequest } from '@lib/with-signed-request';
import { d, decimal, Instrument, useExecutionMode } from '@quantform/core';

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

function withBinanceOrderNew(order: {
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

export type withOrderNewType = typeof withBinanceOrderNew;

export const withOrderNew = (
  args: Parameters<withOrderNewType>
): ReturnType<withOrderNewType> => {
  const { isSimulation } = useExecutionMode();

  if (!isSimulation) {
    return withBinanceOrderNew(...args);
  }

  const { apply } = withSimulator();

  return apply({ type: 'with-order-new-command', args, correlationId: v4() });
};
