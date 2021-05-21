import { ExchangeMarginAdapter } from '../exchange-adapter';
import { InstrumentSelector } from '../domain/instrument';
import { Set } from 'typescript-collections';
import { ExchangeBinanceFutureAwakeHandler } from './handlers/exchange-binance-future-awake.handler';
import { ExchangeBinanceFutureHistoryHandler } from './handlers/exchange-binance-future-history.handler';
import { ExchangeBinanceFutureSubscribeHandler } from './handlers/exchange-binance-future-subscribe.handler';
import { ExchangeBinanceFutureAccountHandler } from './handlers/exchange-binance-future-account.handler';
import { ExchangeBinanceFutureOrderOpenHandler } from './handlers/exchange-binance-future-order-open.handler';
import { ExchangeBinanceFutureOrderCancelHandler } from './handlers/exchange-binance-future-order-cancel.handler';
import Binance = require('node-binance-api');
import {
  ExchangeAccountRequest,
  ExchangeAwakeRequest,
  ExchangeHistoryRequest,
  ExchangeOrderCancelRequest,
  ExchangeOrderOpenRequest,
  ExchangeSubscribeRequest,
  ExchangeImportRequest
} from '../exchange-adapter/exchange-adapter-request';
import { ExchangeBinanceFutureImportHandler } from './handlers/exchange-binance-future-import.handler';
import { now } from '../common';

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

    this.register(ExchangeAwakeRequest, new ExchangeBinanceFutureAwakeHandler(this));
    this.register(ExchangeAccountRequest, new ExchangeBinanceFutureAccountHandler(this));
    this.register(
      ExchangeSubscribeRequest,
      new ExchangeBinanceFutureSubscribeHandler(this)
    );
    this.register(
      ExchangeOrderOpenRequest,
      new ExchangeBinanceFutureOrderOpenHandler(this)
    );
    this.register(
      ExchangeOrderCancelRequest,
      new ExchangeBinanceFutureOrderCancelHandler(this)
    );
    this.register(ExchangeHistoryRequest, new ExchangeBinanceFutureHistoryHandler(this));
    this.register(ExchangeImportRequest, new ExchangeBinanceFutureImportHandler(this));
  }
}
