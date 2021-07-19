import { Set } from 'typescript-collections';
import { BinanceAwakeHandler } from './handlers/binance-awake.handler';
import { BinanceSubscribeHandler } from './handlers/binance-subscribe.handler';
import { BinanceAccountHandler } from './handlers/binance-account.handler';
import { BinanceHistoryHandler } from './handlers/binance-history.handler';
import { BinanceImportHandler } from './handlers/binance-import.handler';
import { BinanceOrderOpenHandler } from './handlers/binance-order-open.handler';
import { BinanceOrderCancelHandler } from './handlers/binance-order-cancel.handler';
import Binance = require('node-binance-api');
import {
  AdapterAccountRequest,
  AdapterAwakeRequest,
  AdapterHistoryRequest,
  AdapterSubscribeRequest,
  AdapterImportRequest,
  AdapterOrderOpenRequest,
  AdapterOrderCancelRequest,
  InstrumentSelector,
  Timeframe,
  Adapter,
  PaperAdapter,
  PaperSpotModel
} from '@quantform/core';

export class BinanceAdapter extends Adapter {
  readonly name = 'binance';
  readonly endpoint: Binance;

  subscription = new Set<InstrumentSelector>();

  constructor(options?: { key: string; secret: string }) {
    super();

    this.endpoint = new Binance().options({
      APIKEY: options?.key ?? process.env.BINANCE_APIKEY,
      APISECRET: options?.secret ?? process.env.BINANCE_APISECRET
    });

    this.register(AdapterAwakeRequest, new BinanceAwakeHandler(this));
    this.register(AdapterAccountRequest, new BinanceAccountHandler(this));
    this.register(AdapterSubscribeRequest, new BinanceSubscribeHandler(this));
    this.register(AdapterOrderOpenRequest, new BinanceOrderOpenHandler(this));
    this.register(AdapterOrderCancelRequest, new BinanceOrderCancelHandler(this));
    this.register(AdapterHistoryRequest, new BinanceHistoryHandler(this));
    this.register(AdapterImportRequest, new BinanceImportHandler(this));
  }

  createPaperModel(adapter: PaperAdapter) {
    return new PaperSpotModel(adapter);
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
