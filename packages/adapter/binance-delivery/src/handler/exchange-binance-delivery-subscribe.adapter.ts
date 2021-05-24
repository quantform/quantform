import {
  AdapterContext,
  AdapterHandler,
  AdapterSubscribeRequest,
  OrderbookPatchEvent,
  Store
} from '@quantform/core';
import { ExchangeBinanceDeliveryAdapter } from '../exchange-binance-delivery.adapter';

export class ExchangeBinanceDeliverySubscribeHandler
  implements AdapterHandler<AdapterSubscribeRequest, void> {
  constructor(private readonly adapter: ExchangeBinanceDeliveryAdapter) {}
  async handle(
    request: AdapterSubscribeRequest,
    store: Store,
    context: AdapterContext
  ): Promise<void> {
    for (const instrument of request.instrument) {
      if (!this.adapter.subscription.add(instrument)) {
        continue;
      }

      await this.adapter.endpoint.deliveryBookTickerStream(instrument.raw, message =>
        store.dispatch(
          new OrderbookPatchEvent(
            instrument,
            parseFloat(message.bestAsk),
            parseFloat(message.bestAskQty),
            parseFloat(message.bestBid),
            parseFloat(message.bestBidQty),
            context.timestamp()
          )
        )
      );
    }
  }
}
