import { Store } from '../../../store';
import { AdapterContext, AdapterHandler } from '../..';
import { Adapter } from '../../adapter';
import { AdapterAwakeRequest } from '../../adapter-request';

export class BacktesterAwakeHandler implements AdapterHandler<AdapterAwakeRequest, void> {
  constructor(private readonly adapter: Adapter) {}

  async handle(
    request: AdapterAwakeRequest,
    store: Store,
    context: AdapterContext
  ): Promise<void> {
    await this.adapter.execute(request, store, context);
  }
}
