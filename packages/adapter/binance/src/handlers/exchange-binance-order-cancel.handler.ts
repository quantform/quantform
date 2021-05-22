import {
  ExchangeAdapterContext,
  ExchangeAdapterHandler,
  ExchangeOrderCancelRequest,
  Logger,
  OrderCanceledEvent,
  OrderCancelFailedEvent,
  OrderCancelingEvent,
  retry,
  Store
} from '@quantform/core';
import { ExchangeBinanceAdapter } from '../exchange-binance-adapter';

export class ExchangeBinanceOrderCancelHandler
  implements ExchangeAdapterHandler<ExchangeOrderCancelRequest, void> {
  constructor(private readonly adapter: ExchangeBinanceAdapter) {}

  async handle(
    request: ExchangeOrderCancelRequest,
    store: Store,
    context: ExchangeAdapterContext
  ): Promise<void> {
    store.dispatch(new OrderCancelingEvent(request.order.id, context.timestamp()));

    const response = await retry<any>(() =>
      this.adapter.endpoint.cancel(
        this.adapter.translateInstrument(request.order.instrument),
        request.order.externalId
      )
    );

    Logger.debug(response);

    if (response.statusCode == 400) {
      store.dispatch(new OrderCancelFailedEvent(request.order.id, context.timestamp()));
    } else {
      store.dispatch(new OrderCanceledEvent(request.order.id, context.timestamp()));
    }
  }
}
