import { Adapter, AdapterContext } from '..';
import { BacktesterStreamer } from './backtester-streamer';
import { PaperAdapter, PaperOptions } from '../paper';
import { timestamp } from '../../shared';
import { InstrumentSubscriptionEvent } from '../../store/event';
import { InstrumentSelector, Order, Candle } from 'src/domain';
import { Feed } from 'src/storage';
import { PaperExecutor } from '../paper/executor/paper-executor';

export class BacktesterOptions extends PaperOptions {
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
    await this.awake(context);
    await this.decoratedAdapter.awake(context);
  }

  dispose(): Promise<void> {
    return this.decoratedAdapter.dispose();
  }

  async subscribe(instruments: InstrumentSelector[]): Promise<void> {
    instruments.forEach(it => {
      this.streamer.subscribe(it);
    });

    this.context.store.dispatch(
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
    from: number,
    to: number,
    destination: Feed,
    callback: (timestamp: number) => void
  ): Promise<void> {
    return this.decoratedAdapter.feed(instrument, from, to, destination, callback);
  }

  createPaperExecutor(adapter: PaperAdapter): PaperExecutor {
    return this.decoratedAdapter.createPaperExecutor(adapter);
  }
}
