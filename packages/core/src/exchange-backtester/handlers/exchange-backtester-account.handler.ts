import { Store } from '../../store';
import { ExchangeAdapterContext, ExchangeAdapterHandler } from '../../exchange-adapter';
import { ExchangeAdapter } from '../../exchange-adapter/exchange-adapter';
import { ExchangeAccountRequest } from '../../exchange-adapter/exchange-adapter-request';

export class ExchangeBacktesterAccountHandler
  implements ExchangeAdapterHandler<ExchangeAccountRequest, void> {
  constructor(private readonly adapter: ExchangeAdapter) {}

  handle(
    request: ExchangeAccountRequest,
    store: Store,
    context: ExchangeAdapterContext
  ): Promise<void> {
    return this.adapter.execute(request, store, context);
  }
}
