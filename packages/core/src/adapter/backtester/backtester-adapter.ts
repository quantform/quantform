import { Adapter, AdapterContext } from '..';
import { BacktesterStreamer } from './backtester-streamer';
import { PaperAdapter, PaperOptions } from '../paper';
import { handler } from '../../common/topic';
import { Logger, timestamp } from '../../common';
import { AdapterSubscribeCommand, AdapterHistoryQuery } from '../adapter.event';
import { InstrumentSubscriptionPatchEvent } from '../../store/event';

export class BacktesterOptions extends PaperOptions {
  from: timestamp;
  to: timestamp;
  progress?: (timestamp: number) => void;
  completed?: () => void;
}

export class BacktesterAdapter extends Adapter {
  readonly name = this.decoratedAdapter.name;

  constructor(readonly decoratedAdapter: Adapter, readonly streamer: BacktesterStreamer) {
    super();
  }

  timestamp() {
    return this.streamer.timestamp;
  }

  createPaperModel(adapter: PaperAdapter) {
    return this.decoratedAdapter.createPaperModel(adapter);
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
        it => new InstrumentSubscriptionPatchEvent(context.timestamp, it, true)
      )
    );

    this.streamer.tryContinue().catch(it => Logger.error(it));
  }

  @handler(AdapterHistoryQuery)
  async onHistory(event: AdapterHistoryQuery, context: AdapterContext) {
    this.streamer.stop();

    const response = await this.decoratedAdapter.dispatch(event, context);

    this.streamer.tryContinue();

    return response;
  }
}
