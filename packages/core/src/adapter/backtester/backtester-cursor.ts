import { BacktestPageNotEmpty } from '@lib/adapter';
import { InstrumentSelector } from '@lib/domain';
import { timestamp } from '@lib/shared';
import { Feed, StorageEvent } from '@lib/storage';

export class BacktesterCursor {
  private page = new Array<StorageEvent>();
  private pageIndex = 0;
  completed = false;

  get size(): number {
    return this.page.length - this.pageIndex;
  }

  constructor(readonly instrument: InstrumentSelector, private readonly feed: Feed) {}

  peek(): StorageEvent | undefined {
    if (!this.page) {
      return undefined;
    }

    return this.page[this.pageIndex];
  }

  dequeue(): StorageEvent {
    return this.page[this.pageIndex++];
  }

  async fetchNextPage(from: timestamp, to: number): Promise<void> {
    if (this.completed) {
      return;
    }

    if (this.size > 0) {
      throw new BacktestPageNotEmpty();
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
