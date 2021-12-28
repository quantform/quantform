import { Store } from '../store';
import { Adapter, AdapterContext } from '.';
import { Logger } from '../shared';
import {
  AdapterAccountCommand,
  AdapterAwakeCommand,
  AdapterDisposeCommand
} from './adapter.event';

/**
 * Manages instances of all adapters provided in session descriptor.
 * Awakes and disposes adapters, routes and executes commands.
 */
export class AdapterAggregate {
  private readonly adapter: Record<string, Adapter> = {};

  constructor(private readonly store: Store, adapters: Adapter[]) {
    adapters.forEach(it => (this.adapter[it.name] = it));
  }

  /**
   * Sets up all adapters.
   * @param usePrivateScope use private api (api keys needed).
   */
  async awake(usePrivateScope = true): Promise<void> {
    for (const adapter in this.adapter) {
      await this.dispatch(adapter, new AdapterAwakeCommand());

      if (usePrivateScope) {
        await this.dispatch(adapter, new AdapterAccountCommand());
      }
    }
  }

  /**
   * Disposes all adapters.
   */
  async dispose(): Promise<any> {
    for (const adapter in this.adapter) {
      await this.dispatch(adapter, new AdapterDisposeCommand());
    }
  }

  /**
   * Routes and executes command to a specific adapter.
   * @param adapterName name of adapter
   * @param event
   * @returns
   */
  dispatch<TEvent extends { type: string }, TResponse>(
    adapterName: string,
    event: TEvent
  ): Promise<TResponse> {
    const adapter = this.adapter[adapterName];

    if (!adapter) {
      throw new Error(
        `Unknown adapter: ${adapterName}. You should provide adapter in session descriptor.`
      );
    }

    try {
      return adapter.dispatch(event, new AdapterContext(adapter, this.store));
    } catch (e) {
      Logger.error(e);
    }
  }
}
