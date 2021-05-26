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
  PaperPlatformMargin
} from '@quantform/core';

export class BinanceDeliveryAdapter extends Adapter {
  public name = 'binancedelivery';

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

    this.register(AdapterAwakeRequest, new BinanceDeliveryAwakeHandler(this));
    this.register(AdapterAccountRequest, new BinanceDeliveryAccountHandler());
    this.register(AdapterSubscribeRequest, new BinanceDeliverySubscribeHandler(this));
  }

  createPaperPlatform(adapter: PaperAdapter) {
    return new PaperPlatformMargin(adapter);
  }

  translateAsset(asset: Instrument): string {
    return `${asset.base.name.toUpperCase()}${asset.quote.name.toUpperCase()}`;
  }
}
