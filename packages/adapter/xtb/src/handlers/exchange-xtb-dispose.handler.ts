import { AdapterHandler, ExchangeDisposeRequest } from '@quantform/core';
import { ExchangeXtbAdapter } from '../exchange-xtb-adapter';

export class ExchangeXtbDisposeHandler
  implements AdapterHandler<ExchangeDisposeRequest, void> {
  constructor(private readonly adapter: ExchangeXtbAdapter) {}

  async handle(): Promise<void> {
    await this.adapter.endpoint.disconnect();
  }
}
