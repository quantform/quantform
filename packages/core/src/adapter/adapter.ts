import { now, timestamp } from '../shared';
import { PaperExecutor } from './paper/executor/paper-executor';
import { PaperAdapter } from './paper';
import { Topic } from '../shared/topic';
import { Store } from '../store';

/**
 * Shared context for adapter execution. Provides access to the store.
 */
export class AdapterContext {
  /**
   * Returns the current unix timestamp (points to historical date in case of backtest).
   */
  get timestamp(): timestamp {
    return this.adapter.timestamp();
  }

  constructor(private readonly adapter: Adapter, readonly store: Store) {}
}

/**
 * Base adapter class, you should derive your own adapter from this class.
 * @abstract
 */
export abstract class Adapter extends Topic<{ type: string }, AdapterContext> {
  abstract name: string;
  abstract createPaperExecutor(adapter: PaperAdapter): PaperExecutor;

  timestamp(): timestamp {
    return now();
  }
}
