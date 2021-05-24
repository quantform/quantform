import { ExchangeAdapter } from '../exchange-adapter';
import { ExchangeBacktesterSubscribeHandler } from '.';
import { ExchangeBacktesterStreamer } from './exchange-backtester.streamer';
import { ExchangeBacktesterHistoryHandler } from './handlers/exchange-backtester-history.handler';
import { ExchangeBacktesterAwakeHandler } from './handlers/exchange-backtester-awake.handler';
import { ExchangeBacktesterAccountHandler } from './handlers/exchange-backtester-account.handler';
import { ExchangeBacktesterOrderOpenHandler } from './handlers/exchange-backtester-order-open.handler';
import { ExchangeBacktesterOrderCancelHandler } from './handlers/exchange-backtester-order-cancel.handler';
import {
  ExchangeAccountRequest,
  ExchangeAwakeRequest,
  ExchangeHistoryRequest,
  ExchangeOrderCancelRequest,
  ExchangeOrderOpenRequest,
  ExchangeSubscribeRequest,
  ExchangeImportRequest
} from '../exchange-adapter/exchange-adapter-request';
import { ExchangeBacktesterImportHandler } from './handlers/exchange-backtester-import.handler';

export class ExchangeBacktesterAdapter extends ExchangeAdapter {
  public name;
  public type;

  constructor(
    readonly adapter: ExchangeAdapter,
    readonly streamer: ExchangeBacktesterStreamer
  ) {
    super();

    this.name = adapter.name;
    this.type = adapter.type;

    this.register(ExchangeAwakeRequest, new ExchangeBacktesterAwakeHandler(adapter));
    this.register(ExchangeAccountRequest, new ExchangeBacktesterAccountHandler(adapter));
    this.register(
      ExchangeSubscribeRequest,
      new ExchangeBacktesterSubscribeHandler(this.streamer)
    );
    this.register(
      ExchangeOrderOpenRequest,
      new ExchangeBacktesterOrderOpenHandler(adapter)
    );
    this.register(
      ExchangeOrderCancelRequest,
      new ExchangeBacktesterOrderCancelHandler(adapter)
    );
    this.register(
      ExchangeHistoryRequest,
      new ExchangeBacktesterHistoryHandler(adapter, this.streamer)
    );
    this.register(ExchangeImportRequest, new ExchangeBacktesterImportHandler(adapter));
  }

  readonly(): boolean {
    return false;
  }

  timestamp() {
    return this.streamer.timestamp;
  }
}
