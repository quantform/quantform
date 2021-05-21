import {
  timestamp,
  BalanceFreezEvent,
  ExchangeAdapterContext,
  ExchangeAdapterHandler,
  ExchangeBinanceAdapter,
  ExchangeOrderOpenRequest,
  Logger,
  Order,
  OrderNewEvent,
  OrderPendingEvent,
  OrderRejectedEvent,
  Store
} from '@quantform/core';

export class ExchangeBinanceOrderOpenHandler
  implements ExchangeAdapterHandler<ExchangeOrderOpenRequest, void> {
  constructor(private readonly adapter: ExchangeBinanceAdapter) {}

  async handle(
    request: ExchangeOrderOpenRequest,
    store: Store,
    context: ExchangeAdapterContext
  ): Promise<void> {
    store.dispatch(
      ...this.caluclateFreezAllocation(store, request.order, context.timestamp()),
      new OrderNewEvent(request.order, context.timestamp())
    );

    const instrument =
      store.snapshot.universe.instrument[request.order.instrument.toString()];

    let response = null;

    switch (request.order.type) {
      case 'MARKET':
        switch (request.order.side) {
          case 'BUY':
            response = await this.adapter.endpoint.marketBuy(
              this.adapter.translateInstrument(instrument),
              request.order.quantity,
              { newClientOrderId: request.order.id }
            );
            break;
          case 'SELL':
            response = await this.adapter.endpoint.marketSell(
              this.adapter.translateInstrument(instrument),
              request.order.quantity,
              { newClientOrderId: request.order.id }
            );
            break;
        }
        break;
      case 'LIMIT':
        switch (request.order.side) {
          case 'BUY':
            response = await this.adapter.endpoint.buy(
              this.adapter.translateInstrument(instrument),
              request.order.quantity,
              request.order.rate.toFixed(instrument.quote.scale),
              { newClientOrderId: request.order.id }
            );
            break;
          case 'SELL':
            response = await this.adapter.endpoint.sell(
              this.adapter.translateInstrument(instrument),
              request.order.quantity,
              request.order.rate.toFixed(instrument.quote.scale),
              { newClientOrderId: request.order.id }
            );
            break;
        }
        break;
      default:
        throw new Error('order type not supported.');
    }

    Logger.debug(response);

    if (response.msg) {
      store.dispatch(new OrderRejectedEvent(request.order.id, context.timestamp()));
    } else {
      if (!request.order.externalId) {
        request.order.externalId = `${response.orderId}`;
      }

      if (response.status == 'NEW') {
        if (request.order.state != 'PENDING') {
          store.dispatch(new OrderPendingEvent(request.order.id, context.timestamp()));
        }
      }
    }
  }

  private caluclateFreezAllocation(
    store: Store,
    order: Order,
    timestamp: timestamp
  ): BalanceFreezEvent[] {
    const snapshot = store.snapshot;
    const quote = snapshot.balance[order.instrument.quote.toString()];

    switch (order.side) {
      case 'BUY':
        switch (order.type) {
          case 'MARKET':
            return [new BalanceFreezEvent(order.instrument.quote, quote.free, timestamp)];

          case 'LIMIT':
            return [
              new BalanceFreezEvent(
                order.instrument.quote,
                quote.asset.ceil(order.rate * order.quantity),
                timestamp
              )
            ];
        }
        break;

      case 'SELL':
        return [new BalanceFreezEvent(order.instrument.base, order.quantity, timestamp)];
    }
  }
}
