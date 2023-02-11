import { useBinanceSignedRequest } from '@lib/use-binance-signed-request';
import { d, decimal, Instrument } from '@quantform/core';

export function useBinanceOrderSubmitCommand(order: {
  instrument: Instrument;
  type: 'MARKET' | 'LIMIT';
  quantity: decimal;
  rate?: decimal;
  timeInForce: 'GTC';
}) {
  return useBinanceSignedRequest<{ orderId: number }>({
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
