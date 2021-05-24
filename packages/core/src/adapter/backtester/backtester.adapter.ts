import { Adapter } from '..';
import { BacktesterSubscribeHandler } from '.';
import { BacktesterStreamer } from './backtester-streamer';
import { BacktesterHistoryHandler } from './handlers/backtester-history.handler';
import { BacktesterAwakeHandler } from './handlers/backtester-awake.handler';
import { BacktesterAccountHandler } from './handlers/backtester-account.handler';
import { BacktesterOrderOpenHandler } from './handlers/backtester-order-open.handler';
import { BacktesterOrderCancelHandler } from './handlers/backtester-order-cancel.handler';
import {
  AdapterAccountRequest,
  AdapterAwakeRequest,
  AdapterHistoryRequest,
  AdapterOrderCancelRequest,
  AdapterOrderOpenRequest,
  AdapterSubscribeRequest,
  AdapterImportRequest
} from '../adapter-request';
import { BacktesterImportHandler } from './handlers/backtester-import.handler';

export class BacktesterAdapter extends Adapter {
  public name;
  public type;

  constructor(readonly adapter: Adapter, readonly streamer: BacktesterStreamer) {
    super();

    this.name = adapter.name;
    this.type = adapter.type;

    this.register(AdapterAwakeRequest, new BacktesterAwakeHandler(adapter));
    this.register(AdapterAccountRequest, new BacktesterAccountHandler(adapter));
    this.register(AdapterSubscribeRequest, new BacktesterSubscribeHandler(this.streamer));
    this.register(AdapterOrderOpenRequest, new BacktesterOrderOpenHandler(adapter));
    this.register(AdapterOrderCancelRequest, new BacktesterOrderCancelHandler(adapter));
    this.register(
      AdapterHistoryRequest,
      new BacktesterHistoryHandler(adapter, this.streamer)
    );
    this.register(AdapterImportRequest, new BacktesterImportHandler(adapter));
  }

  readonly(): boolean {
    return false;
  }

  timestamp() {
    return this.streamer.timestamp;
  }
}
