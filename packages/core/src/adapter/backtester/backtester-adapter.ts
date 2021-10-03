import { Adapter, AdapterContext } from '..';
import { BacktesterStreamer } from './backtester-streamer';
import { PaperAdapter, PaperOptions } from '../paper';
import { handler } from '../../common/topic';
import { timestamp } from '../../common';
import {
  AdapterAwakeCommand,
  AdapterAccountCommand,
  AdapterSubscribeCommand,
  AdapterOrderOpenCommand,
  AdapterOrderCancelCommand,
  AdapterHistoryQuery,
  AdapterImportCommand
} from '../adapter.event';

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

  @handler(AdapterAwakeCommand)
  onAdapterAwakeCommand(event: AdapterAwakeCommand, context: AdapterContext) {
    return this.decoratedAdapter.dispatch(event, context);
  }

  @handler(AdapterAccountCommand)
  onAdapterAccountCommand(event: AdapterAccountCommand, context: AdapterContext) {
    return this.decoratedAdapter.dispatch(event, context);
  }

  @handler(AdapterSubscribeCommand)
  onAdapterSubscribeCommand(event: AdapterSubscribeCommand, context: AdapterContext) {
    event.instrument.forEach(it => {
      this.streamer.subscribe(it);
    });
  }

  @handler(AdapterOrderOpenCommand)
  onAdapterOrderOpenCommand(event: AdapterOrderOpenCommand, context: AdapterContext) {
    return this.decoratedAdapter.dispatch(event, context);
  }

  @handler(AdapterOrderCancelCommand)
  onAdapterOrderCancelCommand(event: AdapterOrderCancelCommand, context: AdapterContext) {
    return this.decoratedAdapter.dispatch(event, context);
  }

  @handler(AdapterHistoryQuery)
  async onAdapterHistoryQuery(event: AdapterHistoryQuery, context: AdapterContext) {
    this.streamer.stop();

    const response = await this.decoratedAdapter.dispatch(event, context);

    this.streamer.tryContinue();

    return response;
  }

  @handler(AdapterImportCommand)
  onAdapterImportCommand(event: AdapterImportCommand, context: AdapterContext) {
    return this.decoratedAdapter.dispatch(event, context);
  }
}
