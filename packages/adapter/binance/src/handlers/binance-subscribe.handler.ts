import {
  AdapterContext,
  AdapterSubscribeCommand,
  OrderbookPatchEvent,
  InstrumentSubscriptionEvent,
  TradePatchEvent
} from '@quantform/core';
import { instrumentToBinance } from '../binance-interop';
import { BinanceAdapter } from '../binance.adapter';

export async function BinanceSubscribeHandler(
  command: AdapterSubscribeCommand,
  context: AdapterContext,
  binance: BinanceAdapter
) {
  for (const instrument of command.instrument) {
    if (!binance.subscription.add(instrument)) {
      continue;
    }

    context.store.dispatch(
      new InstrumentSubscriptionEvent(context.timestamp, instrument, true)
    );

    const symbol = instrumentToBinance(instrument);

    await binance.endpoint.websockets.trades(symbol, payload => {
      context.store.dispatch(
        new TradePatchEvent(
          instrument,
          parseFloat(payload.p),
          parseFloat(payload.q),
          context.timestamp
        )
      );
    });

    await binance.endpoint.websockets.bookTickers(symbol, payload => {
      context.store.dispatch(
        new OrderbookPatchEvent(
          instrument,
          parseFloat(payload.bestAsk),
          parseFloat(payload.bestAskQty),
          parseFloat(payload.bestBid),
          parseFloat(payload.bestBidQty),
          context.timestamp
        )
      );
    });
  }
}
