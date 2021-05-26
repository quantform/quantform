import {
  AdapterContext,
  AdapterHandler,
  AdapterOrderOpenRequest,
  OrderNewEvent,
  OrderPendingEvent,
  OrderRejectedEvent,
  Store
} from '@quantform/core';
import { BinanceFutureAdapter } from '..';
import { binanceFutureTranslateInstrument } from '../binance-future-common';

export class BinanceFutureOrderOpenHandler
  implements AdapterHandler<AdapterOrderOpenRequest, void> {
  constructor(private readonly adapter: BinanceFutureAdapter) {}

  async handle(
    request: AdapterOrderOpenRequest,
    store: Store,
    context: AdapterContext
  ): Promise<void> {
    store.dispatch(new OrderNewEvent(request.order, context.timestamp()));

    let response = null;

    switch (request.order.type) {
      case 'MARKET':
        switch (request.order.side) {
          case 'BUY':
            response = await this.adapter.endpoint.futuresMarketBuy(
              binanceFutureTranslateInstrument(request.order.instrument),
              request.order.quantity,
              { newClientOrderId: request.order.id }
            );
            break;
          case 'SELL':
            response = await this.adapter.endpoint.futuresMarketSell(
              binanceFutureTranslateInstrument(request.order.instrument),
              request.order.quantity,
              { newClientOrderId: request.order.id }
            );
            break;
        }
        break;
      case 'LIMIT':
        switch (request.order.side) {
          case 'BUY':
            response = await this.adapter.endpoint.futuresBuy(
              binanceFutureTranslateInstrument(request.order.instrument),
              request.order.quantity,
              request.order.rate,
              { newClientOrderId: request.order.id }
            );
            break;
          case 'SELL':
            response = await this.adapter.endpoint.futuresSell(
              binanceFutureTranslateInstrument(request.order.instrument),
              request.order.quantity,
              request.order.rate,
              { newClientOrderId: request.order.id }
            );
            break;
        }
        break;
      default:
        throw new Error('order type not supported.');
    }

    if (response.msg) {
      store.dispatch(new OrderRejectedEvent(request.order.id, context.timestamp()));
    } else {
      if (response.status == 'NEW') {
        store.dispatch(new OrderPendingEvent(request.order.id, context.timestamp()));
      }
    }
  }
}