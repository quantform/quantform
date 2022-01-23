import {
  AdapterContext,
  Order,
  OrderNewEvent,
  OrderPendingEvent,
  OrderRejectedEvent
} from '@quantform/core';
import { BinanceFutureAdapter } from '..';
import { instrumentToBinanceFuture } from '../binance-future-interop';

export async function BinanceFutureOrderOpenHandler(
  order: Order,
  context: AdapterContext,
  binanceFuture: BinanceFutureAdapter
): Promise<void> {
  context.dispatch(new OrderNewEvent(order, context.timestamp));

  let response = null;

  switch (order.type) {
    case 'MARKET':
      switch (order.side) {
        case 'BUY':
          response = await binanceFuture.endpoint.futuresMarketBuy(
            instrumentToBinanceFuture(order.instrument),
            order.quantity,
            { newClientOrderId: order.id }
          );
          break;
        case 'SELL':
          response = await binanceFuture.endpoint.futuresMarketSell(
            instrumentToBinanceFuture(order.instrument),
            order.quantity,
            { newClientOrderId: order.id }
          );
          break;
      }
      break;
    case 'LIMIT':
      switch (order.side) {
        case 'BUY':
          response = await binanceFuture.endpoint.futuresBuy(
            instrumentToBinanceFuture(order.instrument),
            order.quantity,
            order.rate,
            { newClientOrderId: order.id }
          );
          break;
        case 'SELL':
          response = await binanceFuture.endpoint.futuresSell(
            instrumentToBinanceFuture(order.instrument),
            order.quantity,
            order.rate,
            { newClientOrderId: order.id }
          );
          break;
      }
      break;
    default:
      throw new Error('order type not supported.');
  }

  if (response.msg) {
    context.dispatch(new OrderRejectedEvent(order.id, context.timestamp));
  } else {
    if (response.status == 'NEW') {
      context.dispatch(new OrderPendingEvent(order.id, context.timestamp));
    }
  }
}
