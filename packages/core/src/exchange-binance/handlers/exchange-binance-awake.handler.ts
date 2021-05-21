import { ExchangeBinanceAdapter } from '../exchange-binance-adapter';
import { Asset } from '../../domain';
import { commisionPercentOf } from '../../domain/commision';
import { Store } from '../../store';
import { ExchangeAwakeRequest } from '../../exchange-adapter/exchange-adapter-request';
import { ExchangeAdapterContext, ExchangeAdapterHandler } from '../../exchange-adapter';
import { InstrumentPatchEvent } from '../../store/event';
import { precision } from '../../common/decimals';
import { cache, retry } from '../../common/policy';

/**
 *
 */
export class ExchangeBinanceAwakeHandler
  implements ExchangeAdapterHandler<ExchangeAwakeRequest, void> {
  constructor(private readonly adapter: ExchangeBinanceAdapter) {}

  async handle(
    request: ExchangeAwakeRequest,
    store: Store,
    context: ExchangeAdapterContext
  ): Promise<void> {
    await this.adapter.endpoint.useServerTime();

    const response = await cache('binance-exchange-info', () =>
      retry<any>(() => this.adapter.endpoint.exchangeInfo())
    );

    store.dispatch(...(response.symbols as any[]).map(it => this.mapAsset(it, context)));
  }

  private mapAsset(response: any, context: ExchangeAdapterContext): InstrumentPatchEvent {
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
