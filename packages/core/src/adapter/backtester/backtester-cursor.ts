import { InstrumentSelector } from '../../domain';
import { timestamp } from '../../shared';
import { Feed } from '../../storage';
import { StoreEvent } from '../../store';
import { backtestPageNotEmpty } from '../error';

export class BacktesterCursor {
  private page = new Array<StoreEvent>();
  private pageIndex = 0;
  completed = false;

  get size(): number {
    return this.page.length - this.pageIndex;
  }

  constructor(readonly instrument: InstrumentSelector, private readonly feed: Feed) {}

  peek(): StoreEvent {
    if (!this.page) {
      return undefined;
    }

    return this.page[this.pageIndex];
  }

  dequeue<T extends StoreEvent>(): T {
    return this.page[this.pageIndex++] as T;
  }

  async fetchNextPage(from: timestamp, to: number): Promise<void> {
    if (this.completed) {
      return;
    }

    if (this.size > 0) {
      throw backtestPageNotEmpty();
    }

    this.pageIndex = 0;
    this.page = await this.feed.query(this.instrument, {
      from,
      to,
      count: 10000
    });

    this.completed = this.page.length == 0;
  }
}
