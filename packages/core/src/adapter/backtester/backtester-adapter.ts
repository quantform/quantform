import { Adapter, AdapterContext } from '..';
import { Candle, InstrumentSelector, Order } from '../../domain';
import { timestamp } from '../../shared';
import { InstrumentSubscriptionEvent } from '../../store';
import { FeedQuery, HistoryQuery } from '../adapter';
import { PaperAdapter, PaperOptions } from '../paper';
import { PaperSimulator } from '../paper/simulator/paper-simulator';
import { BacktesterStreamer } from './backtester-streamer';

export interface BacktesterOptions extends PaperOptions {
  from: timestamp;
  to: timestamp;
}

export class BacktesterAdapter extends Adapter {
  readonly name = this.decoratedAdapter.name;

  timestamp() {
    return this.streamer.timestamp;
  }

  constructor(readonly decoratedAdapter: Adapter, readonly streamer: BacktesterStreamer) {
    super();
  }

  async awake(context: AdapterContext): Promise<void> {
    await super.awake(context);
    await this.decoratedAdapter.awake(context);
  }

  dispose(): Promise<void> {
    return this.decoratedAdapter.dispose();
  }

  async subscribe(instruments: InstrumentSelector[]): Promise<void> {
    instruments.forEach(it => {
      this.streamer.subscribe(it);
    });

    this.context.dispatch(
      ...instruments.map(
        it => new InstrumentSubscriptionEvent(this.context.timestamp, it, true)
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

  async history(query: HistoryQuery): Promise<Candle[]> {
    this.streamer.stop();

    const response = await this.decoratedAdapter.history(query);

    this.streamer.tryContinue();

    return response;
  }

  feed(query: FeedQuery): Promise<void> {
    return this.decoratedAdapter.feed(query);
  }

  createPaperSimulator(adapter: PaperAdapter): PaperSimulator {
    return this.decoratedAdapter.createPaperSimulator(adapter);
  }
}
