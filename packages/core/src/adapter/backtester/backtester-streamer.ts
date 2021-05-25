import { Instrument } from '../../domain';
import { BacktesterCursor } from './backtester-cursor';
import { Store } from '../../store';
import { Logger, timestamp } from '../../common';
import { BacktesterOptions } from './backtester-options';
import { Feed } from '../../feed';

export class BacktesterStreamer {
  private cursor: Record<string, BacktesterCursor> = {};
  private stopAcquire = 1;

  timestamp: timestamp;
  from: timestamp;
  to: timestamp;
  sequence = 0;

  completed?: () => void;

  constructor(
    private readonly store: Store,
    private readonly feed: Feed,
    private readonly options: BacktesterOptions
  ) {
    this.timestamp = this.options.from;
    this.from = this.options.from;
    this.to = this.options.to;
    this.completed = this.options.completed;
  }

  subscribe(instrument: Instrument) {
    if (instrument.toString() in this.cursor) {
      return;
    }

    const cursor = new BacktesterCursor(instrument, this.feed);

    this.cursor[instrument.toString()] = cursor;

    this.tryContinue().catch(it => Logger.error(it));
  }

  stop() {
    this.stopAcquire++;
  }

  async tryContinue(): Promise<void> {
    if (this.stopAcquire == 0) {
      return;
    }

    this.stopAcquire = Math.max(0, this.stopAcquire - 1);

    if (this.stopAcquire != 0) {
      return;
    }

    //TODO:
    //ipcBacktestNotify(this.from, this.to, this.timestamp);

    while (await this.processNext()) {
      if (this.sequence % 10000 == 0) {
        //TODO:
        //ipcBacktestNotify(this.from, this.to, this.timestamp);
      }

      if (this.stopAcquire > 0) {
        return;
      }
    }

    if (this.completed) {
      this.completed();
    }
  }

  private async processNext(): Promise<boolean> {
    const cursor = await this.current(this.timestamp, this.to);
    if (!cursor) {
      return false;
    }

    const event = cursor.peek();

    this.timestamp = event.timestamp;
    this.sequence++;

    this.store.dispatch(event);

    if (cursor.dequeue().timestamp != event.timestamp) {
      throw new Error('invalid event to consume');
    }

    return true;
  }

  private async current(from: timestamp, to: timestamp): Promise<BacktesterCursor> {
    for (const cursor of Object.values(this.cursor)) {
      if (cursor.size == 0 && !cursor.completed) {
        await cursor.fetchNextPage(from, to);
      }
    }

    return Object.values(this.cursor)
      .filter(it => it.peek() != null)
      .sort((lhs, rhs) => lhs.peek().timestamp - rhs.peek().timestamp)
      .find(() => true);
  }
}
