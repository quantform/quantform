import {
  AdapterContext,
  AdapterOrderCancelCommand,
  Logger,
  OrderCanceledEvent,
  OrderCancelFailedEvent,
  OrderCancelingEvent,
  retry
} from '@quantform/core';
import { BinanceAdapter } from '../binance.adapter';

export async function BinanceOrderCancelHandler(
  command: AdapterOrderCancelCommand,
  context: AdapterContext,
  binance: BinanceAdapter
): Promise<void> {
  context.store.dispatch(new OrderCancelingEvent(command.order.id, context.timestamp));

  const response = await retry<any>(() =>
    binance.endpoint.cancel(
      this.adapter.translateInstrument(command.order.instrument),
      command.order.externalId
    )
  );

  Logger.debug(response);

  if (response.statusCode == 400) {
    context.store.dispatch(
      new OrderCancelFailedEvent(command.order.id, context.timestamp)
    );
  } else {
    context.store.dispatch(new OrderCanceledEvent(command.order.id, context.timestamp));
  }
}
