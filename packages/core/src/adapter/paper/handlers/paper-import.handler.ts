import { Store } from '../../../store';
import { AdapterContext, AdapterHandler } from '../..';
import { Adapter } from '../../adapter';
import { AdapterImportRequest } from '../../adapter-request';

export class PaperImportHandler implements AdapterHandler<AdapterImportRequest, void> {
  constructor(private readonly adapter: Adapter) {}

  handle(
    request: AdapterImportRequest,
    store: Store,
    context: AdapterContext
  ): Promise<void> {
    return this.adapter.execute(request, store, context);
  }
}
