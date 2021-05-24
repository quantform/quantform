import { Candle } from '../../../domain';
import { Adapter } from '../../adapter';
import { AdapterHistoryRequest } from '../../adapter-request';
import { AdapterContext, AdapterHandler } from '../..';
import { Store } from '../../../store';

export class PaperHistoryHandler
  implements AdapterHandler<AdapterHistoryRequest, Candle[]> {
  constructor(private readonly adapter: Adapter) {}

  async handle(
    request: AdapterHistoryRequest,
    store: Store,
    context: AdapterContext
  ): Promise<Candle[]> {
    return this.adapter.execute(request, store, context);
  }
}
