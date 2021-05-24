import { Store } from '../../../store';
import { AdapterContext, AdapterHandler } from '../..';
import { Adapter } from '../../adapter';
import { AdapterAccountRequest } from '../../adapter-request';

export class BacktesterAccountHandler
  implements AdapterHandler<AdapterAccountRequest, void> {
  constructor(private readonly adapter: Adapter) {}

  handle(
    request: AdapterAccountRequest,
    store: Store,
    context: AdapterContext
  ): Promise<void> {
    return this.adapter.execute(request, store, context);
  }
}
