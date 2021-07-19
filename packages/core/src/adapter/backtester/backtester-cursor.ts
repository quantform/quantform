import { Instrument } from '../../domain';
import { ExchangeStoreEvent } from '../../store/event';
import { Feed } from '../../storage';
import { timestamp } from '../../common';

export class BacktesterCursor {
  private page = new Array<ExchangeStoreEvent>();
  private pageIndex = 0;
  completed = false;

  get size(): number {
    return this.page.length - this.pageIndex;
  }

  constructor(readonly instrument: Instrument, private readonly feed: Feed) {}

  peek(): ExchangeStoreEvent {
    if (!this.page) {
      return null;
    }

    return this.page[this.pageIndex];
  }

  dequeue(): ExchangeStoreEvent {
    return this.page[this.pageIndex++];
  }

  async fetchNextPage(from: timestamp, to: timestamp): Promise<void> {
    if (this.completed) {
      return;
    }

    if (this.size > 0) {
      throw new Error('page is not empty');
    }

    this.pageIndex = 0;
    this.page = await this.feed.read(this.instrument, from, to);

    this.completed = this.page.length == 0;
  }
}
