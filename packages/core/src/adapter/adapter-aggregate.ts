import { Adapter } from '.';
import {
  AdapterAccountRequest,
  AdapterRequest,
  AdapterAwakeRequest,
  AdapterDisposeRequest
} from './adapter-request';
import { Logger } from '../common';
import { Store } from '../store';

export class AdapterAggregate {
  private readonly adapter: Record<string, Adapter> = {};

  constructor(private readonly store: Store, adapters: Adapter[]) {
    adapters.forEach(it => (this.adapter[it.name] = it));
  }

  async initialize(): Promise<void> {
    for (const exchange in this.adapter) {
      await this.execute(exchange, new AdapterAwakeRequest());

      if (!this.adapter[exchange].readonly) {
        await this.execute(exchange, new AdapterAccountRequest());
      }
    }
  }

  async dispose(): Promise<any> {
    return Promise.all(
      Object.keys(this.adapter).map(it => this.execute(it, new AdapterDisposeRequest()))
    );
  }

  provide(exchange: string): Adapter {
    return this.adapter[exchange];
  }

  execute<TRequest extends AdapterRequest<TResponse>, TResponse>(
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
