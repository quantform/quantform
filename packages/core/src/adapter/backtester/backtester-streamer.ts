import { InstrumentSelector } from '../../domain';
import { timestamp } from '../../shared';
import { Feed } from '../../storage';
import { Store } from '../../store';
import { BacktesterOptions } from './backtester-adapter';
import { BacktesterCursor } from './backtester-cursor';

/**
 * Listen to backtest session events.
 */
export interface BacktesterListener {
  /**
   * Called once when backtest started.
   */
  onBacktestStarted?(streamer: BacktesterStreamer): void;

  /**
   * Called every time when backtest progress updated.
   */
  onBacktestUpdated?(streamer: BacktesterStreamer): void;

  /**
   * Called once when backtest completed.
   */
  onBacktestCompleted?(streamer: BacktesterStreamer): void;
}

export class BacktesterStreamer {
  private sequenceUpdateBatch = 10000;
  private cursor: Record<string, BacktesterCursor> = {};
  private stopAcquire = 1;

  timestamp: timestamp;
  sequence = 0;

  constructor(
    private readonly store: Store,
    private readonly feed: Feed,
    private readonly options: BacktesterOptions,
    private readonly listener?: BacktesterListener
  ) {
    if (options.from == undefined || options.to == undefined) {
      throw new Error('invalid backtest options, please provide from and to period.');
    }

    this.timestamp = this.options.from;
  }

  subscribe(instrument: InstrumentSelector) {
    if (instrument.toString() in this.cursor) {
      return;
    }

    const cursor = new BacktesterCursor(instrument, this.feed);

    this.cursor[instrument.toString()] = cursor;
  }

  /**
   * Increments stop counter.
   */
  stop() {
    this.stopAcquire++;
  }

  /**
   * Decreases stop counter and continues execution if no more stops requested.
   */
  async tryContinue(): Promise<void> {
    if (this.stopAcquire == 0) {
      return;
    }

    this.stopAcquire = Math.max(0, this.stopAcquire - 1);

    if (this.stopAcquire != 0) {
      return;
    }

    if (this.sequence == 0) {
      if (this.listener.onBacktestStarted) {
        this.listener.onBacktestStarted(this);
      }
    }

    while (await this.processNext()) {
      if (this.sequence % this.sequenceUpdateBatch == 0) {
        if (this.listener.onBacktestUpdated) {
          this.listener.onBacktestUpdated(this);
        }
      }

      if (this.stopAcquire > 0) {
        return;
      }
    }

    if (this.listener.onBacktestCompleted) {
      this.listener.onBacktestCompleted(this);
    }
  }

  private async processNext(): Promise<boolean> {
    const cursor = await this.current(this.timestamp, this.options.to);
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
