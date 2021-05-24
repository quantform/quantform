import { AdapterHandler, AdapterDisposeRequest } from '@quantform/core';
import { XtbAdapter } from '../xtb-adapter';

export class XtbDisposeHandler implements AdapterHandler<AdapterDisposeRequest, void> {
  constructor(private readonly adapter: XtbAdapter) {}

  async handle(): Promise<void> {
    await this.adapter.endpoint.disconnect();
  }
}
