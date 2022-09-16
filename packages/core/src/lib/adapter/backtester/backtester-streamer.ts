import { InstrumentSelector } from '../../domain';
import { timestamp } from '../../shared';
import { Feed } from '../../storage';
import { Store } from '../../store';
import { AdapterTimeProvider } from '../adapter';
import { BacktesterCursor } from './backtester-cursor';
import { invalidEventSequenceError, missingPeriodParametersError } from './error';

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
    private readonly period: { from: number; to: number },
    private readonly listener?: BacktesterListener
  ) {
    if (period.from == undefined || period.to == undefined) {
      throw missingPeriodParametersError();
    }

    this.timestamp = period.from;
  }

  getTimeProvider(): AdapterTimeProvider {
    const provider = {
      timestamp: () => this.timestamp
    };

    return provider;
  }

  subscribe(instrument: InstrumentSelector) {
    if (instrument.id in this.cursor) {
      return;
    }

    const cursor = new BacktesterCursor(instrument, this.feed);

    this.cursor[instrument.id] = cursor;
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
  tryContinue() {
    if (this.stopAcquire == 0) {
      return;
    }

    this.stopAcquire = Math.max(0, this.stopAcquire - 1);

    if (this.stopAcquire != 0) {
      return;
    }

    if (this.sequence == 0) {
      if (this.listener?.onBacktestStarted) {
        this.listener.onBacktestStarted(this);
      }
    }

    const next = async () => {
      if (await this.processNext()) {
        if (this.sequence % this.sequenceUpdateBatch == 0) {
          if (this.listener?.onBacktestUpdated) {
            this.listener.onBacktestUpdated(this);
          }
        }

        if (this.stopAcquire === 0) {
          setImmediate(next);
        }
      } else {
        if (this.listener?.onBacktestCompleted) {
          this.listener.onBacktestCompleted(this);
        }
      }
    };

    next();
  }

  private async processNext(): Promise<boolean> {
    const cursor = await this.current(this.timestamp, this.period.to);
    if (!cursor) {
      return false;
    }

    const event = cursor.peek();
    if (!event) {
      return false;
    }

    this.timestamp = event.timestamp;
    this.sequence++;

    this.store.dispatch(event);

    if (cursor.dequeue().timestamp != event.timestamp) {
      throw invalidEventSequenceError();
    }

    return true;
  }

  private async current(
    from: timestamp,
    to: timestamp
  ): Promise<BacktesterCursor | undefined> {
    for (const cursor of Object.values(this.cursor)) {
      if (cursor.size == 0 && !cursor.completed) {
        await cursor.fetchNextPage(from, to);
      }
    }

    return Object.values(this.cursor)
      .filter(it => it !== undefined)
      .sort((lhs, rhs) => (lhs?.peek()?.timestamp ?? 0) - (rhs?.peek()?.timestamp ?? 0))
      .find(() => true);
  }
}
