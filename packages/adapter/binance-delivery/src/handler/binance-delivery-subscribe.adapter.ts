import {
  AdapterContext,
  AdapterHandler,
  AdapterSubscribeRequest,
  OrderbookPatchEvent,
  Store
} from '@quantform/core';
import { BinanceDeliveryAdapter } from '../binance-delivery.adapter';

export class BinanceDeliverySubscribeHandler
  implements AdapterHandler<AdapterSubscribeRequest, void> {
  constructor(private readonly adapter: BinanceDeliveryAdapter) {}
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
