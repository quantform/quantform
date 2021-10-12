import {
  AdapterContext,
  AdapterSubscribeCommand,
  OrderbookPatchEvent,
  Store
} from '@quantform/core';
import { BinanceDeliveryAdapter } from '../binance-delivery.adapter';

export async function BinanceDeliverySubscribeHandler(
  command: AdapterSubscribeCommand,
  context: AdapterContext,
  binanceDelivery: BinanceDeliveryAdapter
): Promise<void> {
  for (const instrument of command.instrument) {
    if (!binanceDelivery.subscription.add(instrument)) {
      continue;
    }

    const raw = context.store.snapshot.universe.instrument[instrument.toString()].raw;

    await binanceDelivery.endpoint.deliveryBookTickerStream(raw, message =>
      context.store.dispatch(
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
