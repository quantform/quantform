import { Set } from 'typescript-collections';
import { BinanceFutureAwakeHandler } from './handlers/binance-future-awake.handler';
import { BinanceFutureHistoryHandler } from './handlers/binance-future-history.handler';
import { BinanceFutureSubscribeHandler } from './handlers/binance-future-subscribe.handler';
import { BinanceFutureAccountHandler } from './handlers/binance-future-account.handler';
import { BinanceFutureOrderOpenHandler } from './handlers/binance-future-order-open.handler';
import { BinanceFutureOrderCancelHandler } from './handlers/binance-future-order-cancel.handler';
import { BinanceFutureImportHandler } from './handlers/binance-future-import.handler';
import Binance = require('node-binance-api');
import {
  AdapterAccountRequest,
  AdapterAwakeRequest,
  AdapterHistoryRequest,
  AdapterImportRequest,
  AdapterOrderCancelRequest,
  AdapterOrderOpenRequest,
  AdapterSubscribeRequest,
  InstrumentSelector,
  now,
  Adapter,
  PaperAdapter,
  PaperPlatformMargin
} from '@quantform/core';

export class BinanceFutureAdapter extends Adapter {
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

    this.register(AdapterAwakeRequest, new BinanceFutureAwakeHandler(this));
    this.register(AdapterAccountRequest, new BinanceFutureAccountHandler(this));
    this.register(AdapterSubscribeRequest, new BinanceFutureSubscribeHandler(this));
    this.register(AdapterOrderOpenRequest, new BinanceFutureOrderOpenHandler(this));
    this.register(AdapterOrderCancelRequest, new BinanceFutureOrderCancelHandler(this));
    this.register(AdapterHistoryRequest, new BinanceFutureHistoryHandler(this));
    this.register(AdapterImportRequest, new BinanceFutureImportHandler(this));
  }

  createPaperPlatform(adapter: PaperAdapter) {
    return new PaperPlatformMargin(adapter);
  }
}
