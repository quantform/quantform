import { Store } from '../store';
import { Adapter } from '.';
import { Logger } from '../common';
import {
  AdapterAccountCommand,
  AdapterAwakeCommand,
  AdapterDisposeCommand
} from './adapter.event';

export class AdapterAggregate {
  private readonly adapter: Record<string, Adapter> = {};

  constructor(private readonly store: Store, adapters: Adapter[]) {
    adapters.forEach(it => (this.adapter[it.name] = it));
  }

  async initialize(usePrivateScope = true): Promise<void> {
    for (const exchange in this.adapter) {
      await this.dispatch(exchange, new AdapterAwakeCommand());

      if (usePrivateScope) {
        await this.dispatch(exchange, new AdapterAccountCommand());
      }
    }
  }

  async dispose(): Promise<any> {
    return Promise.all(
      Object.keys(this.adapter).map(it => this.dispatch(it, new AdapterDisposeCommand()))
    );
  }

  dispatch<TEvent extends { type: string }, TResponse>(
    exchange: string,
    event: TEvent
  ): Promise<TResponse> {
    const adapter = this.adapter[exchange];

    if (!adapter) {
      throw new Error(`Unknown adapter: ${exchange}`);
    }

    try {
      const context = {
        timestamp: adapter.timestamp(),
        store: this.store
      };

      return adapter.dispatch(event, context);
    } catch (e) {
      Logger.error(e);
    }
  }
}
