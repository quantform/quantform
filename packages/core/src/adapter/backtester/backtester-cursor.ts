import { InstrumentSelector } from '../../domain';
import { StoreEvent } from '../../store/event';
import { Feed } from '../../storage';
import { timestamp } from '../../common';

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

  dequeue(): StoreEvent & any {
    return this.page[this.pageIndex++];
  }

  async fetchNextPage(from: timestamp, to: number): Promise<void> {
    if (this.completed) {
      return;
    }

    if (this.size > 0) {
      throw new Error('page is not empty');
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
