import { Store } from '../../store';
import { ExchangeAdapterContext, ExchangeAdapterHandler } from '../../exchange-adapter';
import { ExchangeAdapter } from '../../exchange-adapter/exchange-adapter';
import { ExchangeSubscribeRequest } from '../../exchange-adapter/exchange-adapter-request';

export class ExchangePaperTradingSubscribeHandler
  implements ExchangeAdapterHandler<ExchangeSubscribeRequest, void> {
  constructor(private readonly adapter: ExchangeAdapter) {}

  async handle(
    request: ExchangeSubscribeRequest,
    store: Store,
    context: ExchangeAdapterContext
  ): Promise<void> {
    return this.adapter.execute(request, store, context);
  }
}
