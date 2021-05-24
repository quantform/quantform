import { Set } from 'typescript-collections';
import { ExchangeBinanceFutureAwakeHandler } from './handlers/exchange-binance-future-awake.handler';
import { ExchangeBinanceFutureHistoryHandler } from './handlers/exchange-binance-future-history.handler';
import { ExchangeBinanceFutureSubscribeHandler } from './handlers/exchange-binance-future-subscribe.handler';
import { ExchangeBinanceFutureAccountHandler } from './handlers/exchange-binance-future-account.handler';
import { ExchangeBinanceFutureOrderOpenHandler } from './handlers/exchange-binance-future-order-open.handler';
import { ExchangeBinanceFutureOrderCancelHandler } from './handlers/exchange-binance-future-order-cancel.handler';
import { ExchangeBinanceFutureImportHandler } from './handlers/exchange-binance-future-import.handler';
import Binance = require('node-binance-api');
import {
  AdapterAccountRequest,
  AdapterAwakeRequest,
  AdapterHistoryRequest,
  AdapterImportRequest,
  ExchangeMarginAdapter,
  AdapterOrderCancelRequest,
  AdapterOrderOpenRequest,
  AdapterSubscribeRequest,
  InstrumentSelector,
  now
} from '@quantform/core';

export class ExchangeBinanceFutureAdapter extends ExchangeMarginAdapter {
  public name = 'binancefuture';

  endpoint = new Binance().options({
    APIKEY: process.env.BINANCE_APIKEY,
    APISECRET: process.env.BINANCE_APISECRET
  });

  subscribed = new Set<InstrumentSelector>();

  timestamp() {
    return now();
  }

  constructor() {
    super();

    this.register(AdapterAwakeRequest, new ExchangeBinanceFutureAwakeHandler(this));
    this.register(AdapterAccountRequest, new ExchangeBinanceFutureAccountHandler(this));
    this.register(
      AdapterSubscribeRequest,
      new ExchangeBinanceFutureSubscribeHandler(this)
    );
    this.register(
      AdapterOrderOpenRequest,
      new ExchangeBinanceFutureOrderOpenHandler(this)
    );
    this.register(
      AdapterOrderCancelRequest,
      new ExchangeBinanceFutureOrderCancelHandler(this)
    );
    this.register(AdapterHistoryRequest, new ExchangeBinanceFutureHistoryHandler(this));
    this.register(AdapterImportRequest, new ExchangeBinanceFutureImportHandler(this));
  }
}
