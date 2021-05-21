import { ExchangeDisposeRequest } from '../../exchange-adapter';
import { ExchangeAdapterHandler } from '../../exchange-adapter';
import { ExchangeXtbAdapter } from '../exchange-xtb-adapter';

export class ExchangeXtbDisposeHandler
  implements ExchangeAdapterHandler<ExchangeDisposeRequest, void> {
  constructor(private readonly adapter: ExchangeXtbAdapter) {}

  async handle(): Promise<void> {
    await this.adapter.endpoint.disconnect();
  }
}
