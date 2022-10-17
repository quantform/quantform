import { Candle, InstrumentSelector, Order } from '../../domain';
import { timestamp } from '../../shared';
import { InstrumentSubscriptionEvent, Store } from '../../store';
import { Adapter } from '..';
import { AdapterFactory, FeedAsyncCallback } from '../adapter';
import { PaperAdapter, PaperOptions } from '../paper';
import { PaperEngine } from '../paper/engine/paper-engine';
import { BacktesterStreamer } from './backtester-streamer';

export interface BacktesterOptions extends PaperOptions {
  from: timestamp;
  to: timestamp;
}

export function createBacktesterAdapterFactory(
  decoratedAdapterFactory: AdapterFactory,
  streamer: BacktesterStreamer
): AdapterFactory {
  return (timeProvider, store, cache) =>
    new BacktesterAdapter(
      decoratedAdapterFactory(timeProvider, store, cache),
      streamer,
      store
    );
}

export class BacktesterAdapter extends Adapter {
  readonly name = this.decoratedAdapter.name;

  constructor(
    readonly decoratedAdapter: Adapter,
    readonly streamer: BacktesterStreamer,
    readonly store: Store
  ) {
    super(streamer.getTimeProvider());
  }

  async awake(): Promise<void> {
    await this.decoratedAdapter.awake();
  }

  dispose(): Promise<void> {
    return this.decoratedAdapter.dispose();
  }

  async subscribe(instruments: InstrumentSelector[]): Promise<void> {
    instruments.forEach(it => {
      this.streamer.subscribe(it);
    });

    this.store.dispatch(
      ...instruments.map(
        it => new InstrumentSubscriptionEvent(this.timestamp(), it, true)
      )
    );
  }

  account(): Promise<void> {
    return this.decoratedAdapter.account();
  }

  open(order: Order): Promise<void> {
    return this.decoratedAdapter.open(order);
  }

  cancel(order: Order): Promise<void> {
    return this.decoratedAdapter.cancel(order);
  }

  async history(
    instrument: InstrumentSelector,
    timeframe: number,
    length: number
  ): Promise<Candle[]> {
    this.streamer.stop();

    const response = await this.decoratedAdapter.history(instrument, timeframe, length);

    this.streamer.tryContinue();

    return response;
  }

  feed(
    instrument: InstrumentSelector,
    from: timestamp,
    to: timestamp,
    callback: FeedAsyncCallback
  ): Promise<void> {
    return this.decoratedAdapter.feed(instrument, from, to, callback);
  }

  createPaperEngine(adapter: PaperAdapter): PaperEngine {
    return this.decoratedAdapter.createPaperEngine(adapter);
  }
}
