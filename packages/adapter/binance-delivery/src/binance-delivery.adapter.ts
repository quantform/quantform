import { Set } from 'typescript-collections';
import { BinanceDeliveryAwakeHandler } from './handler/binance-delivery-awake.handler';
import { BinanceDeliveryAccountHandler } from './handler/binance-delivery-account.handler';
import { BinanceDeliverySubscribeHandler } from './handler/binance-delivery-subscribe.adapter';
import Binance = require('node-binance-api');
import {
  AdapterAccountRequest,
  AdapterAwakeRequest,
  DeliveryAdapter,
  AdapterSubscribeRequest,
  Instrument,
  InstrumentSelector,
  now
} from '@quantform/core';

export class BinanceDeliveryAdapter extends DeliveryAdapter {
  public name = 'binancedelivery';

  endpoint = new Binance().options({
    APIKEY: process.env.BINANCE_APIKEY,
    APISECRET: process.env.BINANCE_APISECRET
  });

  subscription = new Set<InstrumentSelector>();

  timestamp() {
    return now();
  }

  readonly() {
    return !process.env.BINANCE_APIKEY || !process.env.BINANCE_APISECRET;
  }

  constructor() {
    super();

    this.register(AdapterAwakeRequest, new BinanceDeliveryAwakeHandler(this));
    this.register(AdapterAccountRequest, new BinanceDeliveryAccountHandler());
    this.register(AdapterSubscribeRequest, new BinanceDeliverySubscribeHandler(this));
  }

  translateAsset(asset: Instrument): string {
    return `${asset.base.name.toUpperCase()}${asset.quote.name.toUpperCase()}`;
  }
}
