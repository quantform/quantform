import { ExchangePaperTradingOptions } from '.';
import { ExchangeAdapter } from '../exchange-adapter';
import {
  ExchangeAccountRequest,
  ExchangeAwakeRequest,
  ExchangeHistoryRequest,
  ExchangeOrderCancelRequest,
  ExchangeOrderOpenRequest,
  ExchangeSubscribeRequest,
  ExchangeImportRequest
} from '../exchange-adapter/exchange-adapter-request';
import { Store } from '../store';
import { ExchangePaperTradingAccountHandler } from './handlers/exchange-paper-trading-account.handler';
import { ExchangePaperTradingAwakeHandler } from './handlers/exchange-paper-trading-awake.handler';
import { ExchangePaperTradingHistoryHandler } from './handlers/exchange-paper-trading-history.handler';
import { ExchangePaperTradingImportHandler } from './handlers/exchange-paper-trading-import.handler';
import { ExchangePaperTradingOrderCancelHandler } from './handlers/exchange-paper-trading-order-cancel.handler';
import { ExchangePaperTradingOrderOpenHandler } from './handlers/exchange-paper-trading-order-open.handler';
import { ExchangePaperTradingSubscribeHandler } from './handlers/exchange-paper-trading-subscribe.handler';
import { ExchangePaperTradingPlatform } from './platforms/exchange-paper-trading-platform';
import { ExchangePaperTradingPlatformMargin } from './platforms/exchange-paper-trading-platform-margin';
import { ExchangePaperTradingPlatformSpot } from './platforms/exchange-paper-trading-platform-spot';

export class ExchangePaperTradingAdapter extends ExchangeAdapter {
  public name;
  public type;

  readonly platform: ExchangePaperTradingPlatform;

  timestamp() {
    return this.adapter.timestamp();
  }

  constructor(
    readonly adapter: ExchangeAdapter,
    readonly store: Store,
    readonly options: ExchangePaperTradingOptions
  ) {
    super();

    this.name = adapter.name;
    this.type = adapter.type;

    switch (this.type) {
      case 'SPOT':
        this.platform = new ExchangePaperTradingPlatformSpot(this);
        break;
      case 'MARGIN':
        this.platform = new ExchangePaperTradingPlatformMargin(this);
        break;
      default:
        throw new Error(`unsupported platfrom type ${this.type}`);
    }

    this.register(ExchangeAwakeRequest, new ExchangePaperTradingAwakeHandler(adapter));
    this.register(ExchangeAccountRequest, new ExchangePaperTradingAccountHandler(this));
    this.register(
      ExchangeSubscribeRequest,
      new ExchangePaperTradingSubscribeHandler(adapter)
    );
    this.register(
      ExchangeOrderOpenRequest,
      new ExchangePaperTradingOrderOpenHandler(this)
    );
    this.register(
      ExchangeOrderCancelRequest,
      new ExchangePaperTradingOrderCancelHandler(this)
    );
    this.register(
      ExchangeHistoryRequest,
      new ExchangePaperTradingHistoryHandler(adapter)
    );
    this.register(ExchangeImportRequest, new ExchangePaperTradingImportHandler(adapter));
  }
}
