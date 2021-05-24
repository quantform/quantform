import { Store } from '../../../store';
import { AdapterContext, AdapterHandler } from '../..';
import { Adapter } from '../../adapter';
import { AdapterAwakeRequest } from '../../adapter-request';

export class PaperAwakeHandler
  implements AdapterHandler<AdapterAwakeRequest, void> {
  constructor(private readonly adapter: Adapter) {}

  handle(
    request: AdapterAwakeRequest,
    store: Store,
    context: AdapterContext
  ): Promise<void> {
    return this.adapter.execute(request, store, context);
  }
}
