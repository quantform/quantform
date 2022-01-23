import {
  AdapterContext,
  OrderbookPatchEvent,
  InstrumentSubscriptionEvent,
  TradePatchEvent,
  InstrumentSelector
} from '@quantform/core';
import { instrumentToBinance } from '../binance-interop';
import { BinanceAdapter } from '../binance.adapter';

export async function BinanceSubscribeHandler(
  instruments: InstrumentSelector[],
  context: AdapterContext,
  binance: BinanceAdapter
) {
  for (const instrument of instruments) {
    if (!binance.subscription.add(instrument)) {
      continue;
    }

    context.dispatch(
      new InstrumentSubscriptionEvent(context.timestamp, instrument, true)
    );

    const symbol = instrumentToBinance(instrument);

    await binance.endpoint.websockets.trades(symbol, payload => {
      context.dispatch(
        new TradePatchEvent(
          instrument,
          parseFloat(payload.p),
          parseFloat(payload.q),
          context.timestamp
        )
      );
    });

    await binance.endpoint.websockets.bookTickers(symbol, payload => {
      context.dispatch(
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
