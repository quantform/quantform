import {
  AdapterContext,
  AdapterHandler,
  AdapterSubscribeRequest,
  OrderbookPatchEvent,
  Store,
  TradePatchEvent
} from '@quantform/core';
import { ExchangeBinanceFutureAdapter } from '../exchange-binance-future-adapter';
import { binanceFutureTranslateInstrument } from '../exchange-binance-future-common';

export class ExchangeBinanceFutureSubscribeHandler
  implements AdapterHandler<AdapterSubscribeRequest, void> {
  constructor(private readonly adapter: ExchangeBinanceFutureAdapter) {}

  async handle(
    request: AdapterSubscribeRequest,
    store: Store,
    context: AdapterContext
  ): Promise<void> {
    for (const instrument of request.instrument) {
      if (!this.adapter.subscribed.add(instrument)) {
        continue;
      }

      const symbol = binanceFutureTranslateInstrument(instrument);

      await this.adapter.endpoint.futuresAggTradeStream(symbol, message => {
        store.dispatch(
          new TradePatchEvent(
            instrument,
            parseFloat(message.price),
            parseFloat(message.amount),
            context.timestamp()
          )
        );
      });

      await this.adapter.endpoint.futuresBookTickerStream(symbol, message =>
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