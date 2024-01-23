import { d, decimal, Instrument } from '@quantform/core';

import { withOrderNewRequest } from './api';

export function withOrderNew(order: {
  instrument: Instrument;
  type: 'MARKET' | 'LIMIT';
  quantity: decimal;
  rate?: decimal;
  timeInForce: 'GTC';
  id?: string;
}) {
  return withOrderNewRequest({
    symbol: order.instrument.raw,
    type: order.type,
    side: order.quantity.greaterThan(d.Zero) ? 'BUY' : 'SELL',
    quantity: order.instrument.base.fixed(order.quantity.abs()),
    price: order.rate ? order.instrument.quote.fixed(order.rate) : undefined,
    timeInForce: order.timeInForce,
    newClientOrderId: order.id
  });
}
