import {
  AdapterContext,
  AdapterOrderCancelCommand,
  OrderCanceledEvent,
  OrderCancelingEvent
} from '@quantform/core';
import { BinanceFutureAdapter } from '..';
import { instrumentToBinanceFuture } from '../binance-future-interop';

export async function BinanceFutureOrderCancelHandler(
  command: AdapterOrderCancelCommand,
  context: AdapterContext,
  binanceFuture: BinanceFutureAdapter
): Promise<void> {
  context.store.dispatch(new OrderCancelingEvent(command.order.id, context.timestamp));

  await binanceFuture.endpoint.futuresCancel(
    instrumentToBinanceFuture(command.order.instrument),
    {
      orderId: command.order.externalId
    }
  );

  context.store.dispatch(new OrderCanceledEvent(command.order.id, context.timestamp));
}
