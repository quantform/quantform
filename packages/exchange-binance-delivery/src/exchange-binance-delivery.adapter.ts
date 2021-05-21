import { Set } from 'typescript-collections';
import { ExchangeBinanceDeliveryAwakeHandler } from './handler/exchange-binance-delivery-awake.handler';
import { ExchangeBinanceDeliveryAccountHandler } from './handler/exchange-binance-delivery-account.handler';
import { ExchangeBinanceDeliverySubscribeHandler } from './handler/exchange-binance-delivery-subscribe.adapter';
import Binance = require('node-binance-api');
import {
  ExchangeAccountRequest,
  ExchangeAwakeRequest,
  ExchangeDeliveryAdapter,
  ExchangeSubscribeRequest,
  Instrument,
  InstrumentSelector,
  now
} from '@quantform/core';

export class ExchangeBinanceDeliveryAdapter extends ExchangeDeliveryAdapter {
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

    this.register(ExchangeAwakeRequest, new ExchangeBinanceDeliveryAwakeHandler(this));
    this.register(ExchangeAccountRequest, new ExchangeBinanceDeliveryAccountHandler());
    this.register(
      ExchangeSubscribeRequest,
      new ExchangeBinanceDeliverySubscribeHandler(this)
    );
  }

  translateAsset(asset: Instrument): string {
    return `${asset.base.name.toUpperCase()}${asset.quote.name.toUpperCase()}`;
  }
}
