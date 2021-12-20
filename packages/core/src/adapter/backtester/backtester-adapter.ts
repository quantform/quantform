import { Adapter, AdapterContext } from '..';
import { BacktesterListener, BacktesterStreamer } from './backtester-streamer';
import { PaperAdapter, PaperOptions } from '../paper';
import { handler } from '../../shared/topic';
import { Logger, timestamp } from '../../shared';
import { AdapterSubscribeCommand, AdapterHistoryQuery } from '../adapter.event';
import { InstrumentSubscriptionEvent } from '../../store/event';

export class BacktesterOptions extends PaperOptions {
  from: timestamp;
  to: timestamp;
  listener: BacktesterListener;
}

export class BacktesterAdapter extends Adapter {
  readonly name = this.decoratedAdapter.name;

  constructor(readonly decoratedAdapter: Adapter, readonly streamer: BacktesterStreamer) {
    super();
  }

  timestamp() {
    return this.streamer.timestamp;
  }

  createPaperExecutor(adapter: PaperAdapter) {
    return this.decoratedAdapter.createPaperExecutor(adapter);
  }

  onUnknownEvent(event: { type: string }, context: AdapterContext) {
    return this.decoratedAdapter.dispatch(event, context);
  }

  @handler(AdapterSubscribeCommand)
  onSubscribe(command: AdapterSubscribeCommand, context: AdapterContext) {
    command.instrument.forEach(it => {
      this.streamer.subscribe(it);
    });

    context.store.dispatch(
      ...command.instrument.map(
        it => new InstrumentSubscriptionEvent(context.timestamp, it, true)
      )
    );
  }

  @handler(AdapterHistoryQuery)
  async onHistory(event: AdapterHistoryQuery, context: AdapterContext) {
    this.streamer.stop();

    const response = await this.decoratedAdapter.dispatch(event, context);

    this.streamer.tryContinue();

    return response;
  }
}
