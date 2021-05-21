import { ExchangeBinanceAdapter } from '../exchange-binance-adapter';
import { ExchangeSubscribeRequest } from '../../exchange-adapter/exchange-adapter-request';
import { ExchangeAdapterContext, ExchangeAdapterHandler } from '../../exchange-adapter';
import { Store } from '../../store';
import { OrderbookPatchEvent, TradePatchEvent } from '../../store/event';
/**
 *
 */
export class ExchangeBinanceSubscribeHandler
  implements ExchangeAdapterHandler<ExchangeSubscribeRequest, void> {
  constructor(private readonly adapter: ExchangeBinanceAdapter) {}

  async handle(
    request: ExchangeSubscribeRequest,
    store: Store,
    context: ExchangeAdapterContext
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
