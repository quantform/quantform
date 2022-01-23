import { AdapterContext, InstrumentSelector, OrderbookPatchEvent } from '@quantform/core';
import { BinanceDeliveryAdapter } from '../binance-delivery.adapter';

export async function BinanceDeliverySubscribeHandler(
  instruments: InstrumentSelector[],
  context: AdapterContext,
  binanceDelivery: BinanceDeliveryAdapter
): Promise<void> {
  for (const instrument of instruments) {
    if (!binanceDelivery.subscription.add(instrument)) {
      continue;
    }

    const raw = context.snapshot.universe.instrument[instrument.toString()].raw;

    await binanceDelivery.endpoint.deliveryBookTickerStream(raw, message =>
      context.dispatch(
        new OrderbookPatchEvent(
          instrument,
          parseFloat(message.bestAsk),
          parseFloat(message.bestAskQty),
          parseFloat(message.bestBid),
          parseFloat(message.bestBidQty),
          context.timestamp
        )
      )
    );
  }
}
