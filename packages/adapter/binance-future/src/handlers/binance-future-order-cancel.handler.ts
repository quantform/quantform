import {
  AdapterContext,
  AdapterHandler,
  AdapterOrderCancelRequest,
  OrderCanceledEvent,
  OrderCancelingEvent,
  Store
} from '@quantform/core';
import { BinanceFutureAdapter } from '..';
import { binanceFutureTranslateInstrument } from '../binance-future-common';

export class BinanceFutureOrderCancelHandler
  implements AdapterHandler<AdapterOrderCancelRequest, void> {
  constructor(private readonly adapter: BinanceFutureAdapter) {}

  async handle(
    request: AdapterOrderCancelRequest,
    store: Store,
    context: AdapterContext
  ): Promise<void> {
    store.dispatch(new OrderCancelingEvent(request.order.id, context.timestamp()));

    await this.adapter.endpoint.futuresCancel(
      binanceFutureTranslateInstrument(request.order.instrument),
      {
        orderId: request.order.externalId
      }
    );

    store.dispatch(new OrderCanceledEvent(request.order.id, context.timestamp()));
  }
}
