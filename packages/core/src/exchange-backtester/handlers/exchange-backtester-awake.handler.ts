import { Store } from '../../store';
import { ExchangeAdapterContext, ExchangeAdapterHandler } from '../../exchange-adapter';
import { ExchangeAdapter } from '../../exchange-adapter/exchange-adapter';
import { ExchangeAwakeRequest } from '../../exchange-adapter/exchange-adapter-request';

export class ExchangeBacktesterAwakeHandler
  implements ExchangeAdapterHandler<ExchangeAwakeRequest, void> {
  constructor(private readonly adapter: ExchangeAdapter) {}

  async handle(
    request: ExchangeAwakeRequest,
    store: Store,
    context: ExchangeAdapterContext
  ): Promise<void> {
    await this.adapter.execute(request, store, context);
  }
}
