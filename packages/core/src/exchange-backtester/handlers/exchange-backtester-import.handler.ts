import { Store } from '../../store';
import { ExchangeAdapterContext, ExchangeAdapterHandler } from '../../exchange-adapter';
import { ExchangeAdapter } from '../../exchange-adapter/exchange-adapter';
import { ExchangeImportRequest } from '../../exchange-adapter/exchange-adapter-request';

export class ExchangeBacktesterImportHandler
  implements ExchangeAdapterHandler<ExchangeImportRequest, void> {
  constructor(private readonly adapter: ExchangeAdapter) {}

  handle(
    request: ExchangeImportRequest,
    store: Store,
    context: ExchangeAdapterContext
  ): Promise<void> {
    return this.adapter.execute(request, store, context);
  }
}
