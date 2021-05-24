import {
  AdapterContext,
  AdapterHandler,
  AdapterSubscribeRequest,
  OrderbookPatchEvent,
  Store,
  TradePatchEvent
} from '@quantform/core';
import { BinanceAdapter } from '../binance-adapter';

export class BinanceSubscribeHandler
  implements AdapterHandler<AdapterSubscribeRequest, void> {
  constructor(private readonly adapter: BinanceAdapter) {}

  async handle(
    request: AdapterSubscribeRequest,
    store: Store,
    context: AdapterContext
  ): Promise<void> {
    for (const instrument of request.instrument) {
      if (!this.adapter.subscription.add(instrument)) {
        continue;
      }

      const symbol = this.adapter.translateInstrument(instrument);

      await this.adapter.endpoint.websockets.trades(symbol, message => {
        store.dispatch(
          new TradePatchEvent(
            instrument,
            parseFloat(message.p),
            parseFloat(message.q),
            context.timestamp()
          )
        );
      });

      await this.adapter.endpoint.websockets.bookTickers(symbol, message => {
        store.dispatch(
          new OrderbookPatchEvent(
            instrument,
            parseFloat(message.bestAsk),
            parseFloat(message.bestAskQty),
            parseFloat(message.bestBid),
            parseFloat(message.bestBidQty),
            context.timestamp()
          )
        );
      });
    }
  }
}
