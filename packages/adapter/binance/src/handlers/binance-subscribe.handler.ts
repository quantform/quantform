import {
  AdapterContext,
  AdapterSubscribeCommand,
  OrderbookPatchEvent,
  TradePatchEvent
} from '@quantform/core';
import { instrumentToBinance } from '../binance-interop';
import { BinanceAdapter } from '../binance-adapter';

export async function BinanceSubscribeHandler(
  command: AdapterSubscribeCommand,
  context: AdapterContext,
  binance: BinanceAdapter
) {
  for (const instrument of command.instrument) {
    if (!binance.subscription.add(instrument)) {
      continue;
    }

    const symbol = instrumentToBinance(instrument);

    await binance.endpoint.websockets.trades(symbol, message => {
      context.store.dispatch(
        new TradePatchEvent(
          instrument,
          parseFloat(message.p),
          parseFloat(message.q),
          context.timestamp
        )
      );
    });

    await binance.endpoint.websockets.bookTickers(symbol, message => {
      context.store.dispatch(
        new OrderbookPatchEvent(
          instrument,
          parseFloat(message.bestAsk),
          parseFloat(message.bestAskQty),
          parseFloat(message.bestBid),
          parseFloat(message.bestBidQty),
          context.timestamp
        )
      );
    });
  }
}
