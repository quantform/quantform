import {
  AdapterContext,
  AdapterHandler,
  AdapterOrderCancelRequest,
  Logger,
  OrderCanceledEvent,
  OrderCancelFailedEvent,
  OrderCancelingEvent,
  retry,
  Store
} from '@quantform/core';
import { BinanceAdapter } from '../binance-adapter';

export class BinanceOrderCancelHandler
  implements AdapterHandler<AdapterOrderCancelRequest, void> {
  constructor(private readonly adapter: BinanceAdapter) {}

  async handle(
    request: AdapterOrderCancelRequest,
    store: Store,
    context: AdapterContext
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
