import { Set } from 'typescript-collections';
import { BinanceDeliveryAwakeHandler } from './handler/binance-delivery-awake.handler';
import { BinanceDeliveryAccountHandler } from './handler/binance-delivery-account.handler';
import { BinanceDeliverySubscribeHandler } from './handler/binance-delivery-subscribe.adapter';
import Binance = require('node-binance-api');
import {
  AdapterAccountRequest,
  AdapterAwakeRequest,
  AdapterSubscribeRequest,
  Instrument,
  InstrumentSelector,
  now,
  Adapter,
  PaperAdapter,
  PaperMarginModel
} from '@quantform/core';

export class BinanceDeliveryAdapter extends Adapter {
  readonly name = 'binancedelivery';
  readonly endpoint: Binance;

  subscription = new Set<InstrumentSelector>();

  constructor(options?: { key: string; secret: string }) {
    super();

    this.endpoint = new Binance().options({
      APIKEY: options?.key ?? process.env.BINANCE_APIKEY,
      APISECRET: options?.secret ?? process.env.BINANCE_APISECRET
    });

    this.register(AdapterAwakeRequest, new BinanceDeliveryAwakeHandler(this));
    this.register(AdapterAccountRequest, new BinanceDeliveryAccountHandler());
    this.register(AdapterSubscribeRequest, new BinanceDeliverySubscribeHandler(this));
  }

  timestamp() {
    return now();
  }

  createPaperModel(adapter: PaperAdapter) {
    return new PaperMarginModel(adapter);
  }

  translateAsset(asset: Instrument): string {
    return `${asset.base.name.toUpperCase()}${asset.quote.name.toUpperCase()}`;
  }
}
