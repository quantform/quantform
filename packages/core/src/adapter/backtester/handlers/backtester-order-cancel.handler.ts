import { Store } from '../../../store';
import { AdapterContext, AdapterHandler } from '../..';
import { Adapter } from '../../adapter';
import { AdapterOrderCancelRequest } from '../../adapter-request';

export class BacktesterOrderCancelHandler
  implements AdapterHandler<AdapterOrderCancelRequest, void> {
  constructor(private readonly adapter: Adapter) {}

  handle(
    request: AdapterOrderCancelRequest,
    store: Store,
    context: AdapterContext
  ): Promise<void> {
    return this.adapter.execute(request, store, context);
  }
}
