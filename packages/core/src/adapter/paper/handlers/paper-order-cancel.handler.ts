import { AdapterHandler } from '../..';
import { AdapterOrderCancelRequest } from '../../adapter-request';
import { PaperAdapter } from '../paper-adapter';

export class PaperOrderCancelHandler
  implements AdapterHandler<AdapterOrderCancelRequest, void> {
  constructor(private readonly adapter: PaperAdapter) {}

  async handle(request: AdapterOrderCancelRequest): Promise<void> {
    this.adapter.platform.cancel(request.order);
  }
}
