import { Store } from '../../../store';
import { AdapterContext, AdapterHandler } from '../..';
import { Adapter } from '../../adapter';
import { AdapterOrderOpenRequest } from '../../adapter-request';

export class BacktesterOrderOpenHandler
  implements AdapterHandler<AdapterOrderOpenRequest, void> {
  constructor(private readonly adapter: Adapter) {}

  handle(
    request: AdapterOrderOpenRequest,
    store: Store,
    context: AdapterContext
  ): Promise<void> {
    return this.adapter.execute(request, store, context);
  }
}
