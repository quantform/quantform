import {
  Asset,
  commissionPercentOf,
  AdapterContext,
  InstrumentPatchEvent,
  AdapterAwakeCommand
} from '@quantform/core';
import { BinanceDeliveryAdapter } from '../';

export async function BinanceDeliveryAwakeHandler(
  command: AdapterAwakeCommand,
  context: AdapterContext,
  binanceDelivery: BinanceDeliveryAdapter
) {
  await binanceDelivery.endpoint.useServerTime();

  const response = await binanceDelivery.endpoint.deliveryExchangeInfo();

  context.store.dispatch(...(response.symbols as any[]).map(it => mapAsset(it, context)));
}

function mapAsset(response: any, context: AdapterContext): InstrumentPatchEvent {
  const base = new Asset(
    response.baseAsset,
    this.adapter.name,
    response.baseAssetPrecision
  );
  const quote = new Asset(
    response.quoteAsset,
    this.adapter.name,
    response.quotePrecision
  );

  return new InstrumentPatchEvent(
    context.timestamp,
    base,
    quote,
    commissionPercentOf(0.1, 0.1),
    response.symbol
  );
}
