import {
  Asset,
  commisionPercentOf,
  ExchangeAdapterContext,
  ExchangeAdapterHandler,
  ExchangeAwakeRequest,
  InstrumentPatchEvent,
  Store
} from '@quantform/core';
import { ExchangeBinanceDeliveryAdapter } from '../exchange-binance-delivery.adapter';

export class ExchangeBinanceDeliveryAwakeHandler
  implements ExchangeAdapterHandler<ExchangeAwakeRequest, void> {
  constructor(private readonly adapter: ExchangeBinanceDeliveryAdapter) {}

  async handle(
    request: ExchangeAwakeRequest,
    store: Store,
    context: ExchangeAdapterContext
  ): Promise<void> {
    await this.adapter.endpoint.useServerTime();

    const response = await this.adapter.endpoint.deliveryExchangeInfo();

    store.dispatch(...(response.symbols as any[]).map(it => this.mapAsset(it, context)));
  }

  private mapAsset(response: any, context: ExchangeAdapterContext): InstrumentPatchEvent {
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
