import { now, timestamp } from '../common';
import { PaperModel } from './paper/model/paper-model';
import { PaperAdapter } from './paper';
import { Topic } from '../common/topic';
import { Store } from '../store';

export interface AdapterContext {
  timestamp: timestamp;
  store: Store;
}

export abstract class Adapter extends Topic<{ type: string }, AdapterContext> {
  abstract name: string;
  abstract createPaperModel(adapter: PaperAdapter): PaperModel;

  timestamp(): timestamp {
    return now();
  }
}
