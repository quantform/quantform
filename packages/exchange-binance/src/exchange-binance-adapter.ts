import { Set } from 'typescript-collections';
import { ExchangeBinanceAwakeHandler } from './handlers/exchange-binance-awake.handler';
import { ExchangeBinanceSubscribeHandler } from './handlers/exchange-binance-subscribe.handler';
import { ExchangeBinanceAccountHandler } from './handlers/exchange-binance-account.handler';
import { ExchangeBinanceHistoryHandler } from './handlers/exchange-binance-history.handler';
import { ExchangeBinanceImportHandler } from './handlers/exchange-binance-import.handler';
import { ExchangeBinanceOrderOpenHandler } from './handlers/exchange-binance-order-open.handler';
import { ExchangeBinanceOrderCancelHandler } from './handlers/exchange-binance-order-cancel.handler';
import Binance = require('node-binance-api');
import {
  ExchangeAccountRequest,
  ExchangeAwakeRequest,
  ExchangeHistoryRequest,
  ExchangeSubscribeRequest,
  ExchangeImportRequest,
  ExchangeOrderOpenRequest,
  ExchangeOrderCancelRequest,
  ExchangeSpotAdapter,
  InstrumentSelector,
  Timeframe,
  now
} from '@quantform/core';

export class ExchangeBinanceAdapter extends ExchangeSpotAdapter {
  public name = 'binance';

  endpoint = new Binance().options({
    APIKEY: process.env.BINANCE_APIKEY,
    APISECRET: process.env.BINANCE_APISECRET
  });

  subscription = new Set<InstrumentSelector>();

  timestamp() {
    return now();
  }

  constructor() {
    super();

    this.register(ExchangeAwakeRequest, new ExchangeBinanceAwakeHandler(this));
    this.register(ExchangeAccountRequest, new ExchangeBinanceAccountHandler(this));
    this.register(ExchangeSubscribeRequest, new ExchangeBinanceSubscribeHandler(this));
    this.register(ExchangeOrderOpenRequest, new ExchangeBinanceOrderOpenHandler(this));
    this.register(
      ExchangeOrderCancelRequest,
      new ExchangeBinanceOrderCancelHandler(this)
    );
    this.register(ExchangeHistoryRequest, new ExchangeBinanceHistoryHandler(this));
    this.register(ExchangeImportRequest, new ExchangeBinanceImportHandler(this));
  }

  translateInstrument(instrument: InstrumentSelector): string {
    return `${instrument.base.name.toUpperCase()}${instrument.quote.name.toUpperCase()}`;
  }

  translateTimeframe(timeframe: number): string {
    switch (timeframe) {
      case Timeframe.M1:
        return '1m';
      case Timeframe.M5:
        return '5m';
      case Timeframe.M15:
        return '15m';
      case Timeframe.M30:
        return '30m';
      case Timeframe.H1:
        return '1h';
      case Timeframe.H6:
        return 'h6';
      case Timeframe.H12:
        return '12h';
      case Timeframe.D1:
        return '1d';
    }

    throw new Error(`unsupported timeframe: ${timeframe}`);
  }
}
