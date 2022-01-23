import {
  AdapterContext,
  Logger,
  Order,
  OrderCanceledEvent,
  OrderCancelFailedEvent,
  OrderCancelingEvent,
  retry
} from '@quantform/core';
import { instrumentToBinance } from '../binance-interop';
import { BinanceAdapter } from '../binance.adapter';

export async function BinanceOrderCancelHandler(
  order: Order,
  context: AdapterContext,
  binance: BinanceAdapter
): Promise<void> {
  context.dispatch(new OrderCancelingEvent(order.id, context.timestamp));

  const response = await retry<any>(() =>
    binance.endpoint.cancel(instrumentToBinance(order.instrument), order.externalId)
  );

  Logger.debug(response);

  if (response.statusCode == 400) {
    context.dispatch(new OrderCancelFailedEvent(order.id, context.timestamp));
  } else {
    context.dispatch(new OrderCanceledEvent(order.id, context.timestamp));
  }
}
