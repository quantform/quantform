import { Candle } from '../../domain';
import { ExchangeAdapter } from '../../exchange-adapter/exchange-adapter';
import { ExchangeHistoryRequest } from '../../exchange-adapter/exchange-adapter-request';
import { ExchangeAdapterContext, ExchangeAdapterHandler } from '../../exchange-adapter';
import { Store } from '../../store';

export class ExchangePaperTradingHistoryHandler
  implements ExchangeAdapterHandler<ExchangeHistoryRequest, Candle[]> {
  constructor(private readonly adapter: ExchangeAdapter) {}

  async handle(
    request: ExchangeHistoryRequest,
    store: Store,
    context: ExchangeAdapterContext
  ): Promise<Candle[]> {
    return this.adapter.execute(request, store, context);
  }
}
