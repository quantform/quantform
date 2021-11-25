import { now, timestamp } from '../shared';
import { PaperExecutor } from './paper/executor/paper-executor';
import { PaperAdapter } from './paper';
import { Topic } from '../shared/topic';
import { Store } from '../store';

export class AdapterContext {
  get timestamp(): timestamp {
    return this.adapter.timestamp();
  }

  constructor(private readonly adapter: Adapter, readonly store: Store) {}
}

export abstract class Adapter extends Topic<{ type: string }, AdapterContext> {
  abstract name: string;
  abstract createPaperExecutor(adapter: PaperAdapter): PaperExecutor;

  timestamp(): timestamp {
    return now();
  }
}
