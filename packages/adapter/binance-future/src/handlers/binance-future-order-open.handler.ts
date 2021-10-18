import {
  AdapterContext,
  AdapterOrderOpenCommand,
  OrderNewEvent,
  OrderPendingEvent,
  OrderRejectedEvent
} from '@quantform/core';
import { BinanceFutureAdapter } from '..';
import { instrumentToBinanceFuture } from '../binance-future-interop';

export async function BinanceFutureOrderOpenHandler(
  command: AdapterOrderOpenCommand,
  context: AdapterContext,
  binanceFuture: BinanceFutureAdapter
): Promise<void> {
  context.store.dispatch(new OrderNewEvent(command.order, context.timestamp));

  let response = null;

  switch (command.order.type) {
    case 'MARKET':
      switch (command.order.side) {
        case 'BUY':
          response = await binanceFuture.endpoint.futuresMarketBuy(
            instrumentToBinanceFuture(command.order.instrument),
            command.order.quantity,
            { newClientOrderId: command.order.id }
          );
          break;
        case 'SELL':
          response = await binanceFuture.endpoint.futuresMarketSell(
            instrumentToBinanceFuture(command.order.instrument),
            command.order.quantity,
            { newClientOrderId: command.order.id }
          );
          break;
      }
      break;
    case 'LIMIT':
      switch (command.order.side) {
        case 'BUY':
          response = await binanceFuture.endpoint.futuresBuy(
            instrumentToBinanceFuture(command.order.instrument),
            command.order.quantity,
            command.order.rate,
            { newClientOrderId: command.order.id }
          );
          break;
        case 'SELL':
          response = await binanceFuture.endpoint.futuresSell(
            instrumentToBinanceFuture(command.order.instrument),
            command.order.quantity,
            command.order.rate,
            { newClientOrderId: command.order.id }
          );
          break;
      }
      break;
    default:
      throw new Error('order type not supported.');
  }

  if (response.msg) {
    context.store.dispatch(new OrderRejectedEvent(command.order.id, context.timestamp));
  } else {
    if (response.status == 'NEW') {
      context.store.dispatch(new OrderPendingEvent(command.order.id, context.timestamp));
    }
  }
}
