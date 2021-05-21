import { ExchangeAdapterContext, ExchangeAdapterHandler } from '../../exchange-adapter';
import { ExchangeOrderCancelRequest } from '../../exchange-adapter/exchange-adapter-request';
import { Store } from '../../store';
import { OrderCanceledEvent, OrderCancelingEvent } from '../../store/event';
import { ExchangeBinanceFutureAdapter } from '..';
import { binanceFutureTranslateInstrument } from '../exchange-binance-future-common';

export class ExchangeBinanceFutureOrderCancelHandler
  implements ExchangeAdapterHandler<ExchangeOrderCancelRequest, void> {
  constructor(private readonly adapter: ExchangeBinanceFutureAdapter) {}

  async handle(
    request: ExchangeOrderCancelRequest,
    store: Store,
    context: ExchangeAdapterContext
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
