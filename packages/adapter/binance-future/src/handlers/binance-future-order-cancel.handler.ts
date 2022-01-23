import {
  AdapterContext,
  Order,
  OrderCanceledEvent,
  OrderCancelingEvent
} from '@quantform/core';
import { BinanceFutureAdapter } from '..';
import { instrumentToBinanceFuture } from '../binance-future-interop';

export async function BinanceFutureOrderCancelHandler(
  order: Order,
  context: AdapterContext,
  binanceFuture: BinanceFutureAdapter
): Promise<void> {
  context.dispatch(new OrderCancelingEvent(order.id, context.timestamp));

  await binanceFuture.endpoint.futuresCancel(
    instrumentToBinanceFuture(order.instrument),
    {
      orderId: order.externalId
    }
  );

  context.dispatch(new OrderCanceledEvent(order.id, context.timestamp));
}
