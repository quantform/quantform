import { ExchangeBinanceDeliveryAdapter } from '../exchange-binance-delivery.adapter';
import { ExchangeSubscribeRequest } from '../../exchange-adapter/exchange-adapter-request';
import { ExchangeAdapterContext, ExchangeAdapterHandler } from '../../exchange-adapter';
import { Store } from '../../store';
import { OrderbookPatchEvent } from '../../store/event';
/**
 *
 */
export class ExchangeBinanceDeliverySubscribeHandler
  implements ExchangeAdapterHandler<ExchangeSubscribeRequest, void> {
  constructor(private readonly adapter: ExchangeBinanceDeliveryAdapter) {}
  async handle(
    request: ExchangeSubscribeRequest,
    store: Store,
    context: ExchangeAdapterContext
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
