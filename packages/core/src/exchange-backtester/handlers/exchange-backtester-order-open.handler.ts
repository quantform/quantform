import { Store } from '../../store';
import { ExchangeAdapterContext, ExchangeAdapterHandler } from '../../exchange-adapter';
import { ExchangeAdapter } from '../../exchange-adapter/exchange-adapter';
import { ExchangeOrderOpenRequest } from '../../exchange-adapter/exchange-adapter-request';

export class ExchangeBacktesterOrderOpenHandler
  implements ExchangeAdapterHandler<ExchangeOrderOpenRequest, void> {
  constructor(private readonly adapter: ExchangeAdapter) {}

  handle(
    request: ExchangeOrderOpenRequest,
    store: Store,
    context: ExchangeAdapterContext
  ): Promise<void> {
    return this.adapter.execute(request, store, context);
  }
}
