import { ExchangeAdapterContext, ExchangeAdapterHandler } from '../../exchange-adapter';
import { ExchangeOrderCancelRequest } from '../../exchange-adapter/exchange-adapter-request';
import { Store } from '../../store';
import {
  OrderCanceledEvent,
  OrderCancelFailedEvent,
  OrderCancelingEvent
} from '../../store/event';
import { ExchangeBinanceAdapter } from '..';
import { Logger } from '../../common';
import { retry } from '../../common/policy';

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
