import { AdapterHandler } from '../..';
import { AdapterOrderOpenRequest } from '../../adapter-request';
import { PaperAdapter } from '../paper-adapter';

export class PaperOrderOpenHandler
  implements AdapterHandler<AdapterOrderOpenRequest, void> {
  constructor(private readonly adapter: PaperAdapter) {}

  async handle(request: AdapterOrderOpenRequest): Promise<void> {
    this.adapter.platform.open(request.order);
  }
}
