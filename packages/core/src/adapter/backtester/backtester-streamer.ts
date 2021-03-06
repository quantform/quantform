import { InstrumentSelector } from '../../domain';
import { timestamp } from '../../shared';
import { Feed } from '../../storage';
import { OrderbookPatchEvent, Store, TradePatchEvent } from '../../store';
import { AdapterTimeProvider } from '../adapter';
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
    private readonly period: { from: number; to: number },
    private readonly listener?: BacktesterListener
  ) {
    if (period.from == undefined || period.to == undefined) {
      throw new Error('invalid backtest options, please provide from and to period.');
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
      if (this.listener.onBacktestStarted) {
        this.listener.onBacktestStarted(this);
      }
    }

    const next = async () => {
      if (await this.processNext()) {
        if (this.sequence % this.sequenceUpdateBatch == 0) {
          if (this.listener.onBacktestUpdated) {
            this.listener.onBacktestUpdated(this);
          }
        }

        if (this.stopAcquire === 0) {
          setImmediate(next);
        }
      } else {
        if (this.listener.onBacktestCompleted) {
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

    const candle = cursor.peek();
    const instrument = cursor.instrument;
    const volume = candle.volume ?? 0;

    this.timestamp = candle.timestamp;
    this.sequence++;

    this.dispatch(candle.timestamp, instrument, candle.open, volume);
    this.dispatch(candle.timestamp, instrument, candle.high, volume);
    this.dispatch(candle.timestamp, instrument, candle.low, volume);
    this.dispatch(candle.timestamp, instrument, candle.close, volume);

    if (cursor.dequeue().timestamp != candle.timestamp) {
      throw new Error('invalid event to consume');
    }

    return true;
  }

  private dispatch(
    timestamp: number,
    instrument: InstrumentSelector,
    rate: number,
    volume: number
  ) {
    this.store.dispatch(
      new TradePatchEvent(instrument, rate, volume, timestamp),
      new OrderbookPatchEvent(instrument, rate, volume, rate, volume, timestamp)
    );
  }

  private async current(from: timestamp, to: timestamp): Promise<BacktesterCursor> {
    for (const cursor of Object.values(this.cursor)) {
      if (cursor.size == 0 && !cursor.completed) {
        await cursor.fetchNextPage(from, to);
      }
    }

    return Object.values(this.cursor)
      .filter(it => it.peek() != undefined)
      .sort((lhs, rhs) => lhs.peek().timestamp - rhs.peek().timestamp)
      .find(() => true);
  }
}
