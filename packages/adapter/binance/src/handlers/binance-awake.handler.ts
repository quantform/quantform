import {
  Asset,
  cache,
  commisionPercentOf,
  AdapterContext,
  AdapterHandler,
  AdapterAwakeRequest,
  InstrumentPatchEvent,
  precision,
  retry,
  Store
} from '@quantform/core';
import { BinanceAdapter } from '../binance-adapter';

export class BinanceAwakeHandler implements AdapterHandler<AdapterAwakeRequest, void> {
  constructor(private readonly adapter: BinanceAdapter) {}

  async handle(
    request: AdapterAwakeRequest,
    store: Store,
    context: AdapterContext
  ): Promise<void> {
    await this.adapter.endpoint.useServerTime();

    const response = await cache('binance-exchange-info', () =>
      retry<any>(() => this.adapter.endpoint.exchangeInfo())
    );

    store.dispatch(...(response.symbols as any[]).map(it => this.mapAsset(it, context)));
  }

  private mapAsset(response: any, context: AdapterContext): InstrumentPatchEvent {
    const scale = {
      base: 8,
      quote: 8
    };

    for (const filter of response.filters) {
      switch (filter.filterType) {
        case 'PRICE_FILTER':
          scale.quote = precision(Number(filter['tickSize']));
          break;

        case 'LOT_SIZE':
          scale.base = precision(Number(filter['stepSize']));
          break;
      }
    }

    const base = new Asset(response.baseAsset, this.adapter.name, scale.base);
    const quote = new Asset(response.quoteAsset, this.adapter.name, scale.quote);

    return new InstrumentPatchEvent(
      context.timestamp(),
      base,
      quote,
      commisionPercentOf(0.1, 0.1),
      response.symbol
    );
  }
}
