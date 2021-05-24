import { ExchangeAdapter } from '../exchange-adapter';
import {
  ExchangeAccountRequest,
  ExchangeAdapterRequest,
  ExchangeAwakeRequest,
  ExchangeDisposeRequest
} from '../exchange-adapter/exchange-adapter-request';
import { Logger } from '../common';
import { Store } from '../store';

export class ExchangeAdapterAggregate {
  private readonly adapter: Record<string, ExchangeAdapter> = {};

  constructor(private readonly store: Store, adapters: ExchangeAdapter[]) {
    adapters.forEach(it => (this.adapter[it.name] = it));
  }

  async initialize(): Promise<void> {
    for (const exchange in this.adapter) {
      await this.execute(exchange, new ExchangeAwakeRequest());

      if (!this.adapter[exchange].readonly) {
        await this.execute(exchange, new ExchangeAccountRequest());
      }
    }
  }

  async dispose(): Promise<any> {
    return Promise.all(
      Object.keys(this.adapter).map(it => this.execute(it, new ExchangeDisposeRequest()))
    );
  }

  provide(exchange: string): ExchangeAdapter {
    return this.adapter[exchange];
  }

  execute<TRequest extends ExchangeAdapterRequest<TResponse>, TResponse>(
    exchange: string,
    request: TRequest
  ): Promise<TResponse> {
    const adapter = this.provide(exchange);

    if (!adapter) {
      throw new Error(`invalid exchange name ${exchange}`);
    }

    try {
      return adapter.execute<TRequest, TResponse>(request, this.store, adapter);
    } catch (e) {
      Logger.error(e);
    }
  }
}
