import { Store } from '../../store';
import { ExchangeAdapterContext, ExchangeAdapterHandler } from '../../exchange-adapter';
import { ExchangeAdapter } from '../../exchange-adapter/exchange-adapter';
import { ExchangeOrderCancelRequest } from '../../exchange-adapter/exchange-adapter-request';

export class ExchangeBacktesterOrderCancelHandler
  implements ExchangeAdapterHandler<ExchangeOrderCancelRequest, void> {
  constructor(private readonly adapter: ExchangeAdapter) {}

  handle(
    request: ExchangeOrderCancelRequest,
    store: Store,
    context: ExchangeAdapterContext
  ): Promise<void> {
    return this.adapter.execute(request, store, context);
  }
}
