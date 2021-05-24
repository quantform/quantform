import {
  Asset,
  commisionPercentOf,
  AdapterContext,
  AdapterHandler,
  AdapterAwakeRequest,
  InstrumentPatchEvent,
  Store
} from '@quantform/core';
import { BinanceDeliveryAdapter } from '../binance-delivery.adapter';

export class BinanceDeliveryAwakeHandler
  implements AdapterHandler<AdapterAwakeRequest, void> {
  constructor(private readonly adapter: BinanceDeliveryAdapter) {}

  async handle(
    request: AdapterAwakeRequest,
    store: Store,
    context: AdapterContext
  ): Promise<void> {
    await this.adapter.endpoint.useServerTime();

    const response = await this.adapter.endpoint.deliveryExchangeInfo();

    store.dispatch(...(response.symbols as any[]).map(it => this.mapAsset(it, context)));
  }

  private mapAsset(response: any, context: AdapterContext): InstrumentPatchEvent {
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
      context.timestamp(),
      base,
      quote,
      commisionPercentOf(0.1, 0.1),
      response.symbol
    );
  }
}
