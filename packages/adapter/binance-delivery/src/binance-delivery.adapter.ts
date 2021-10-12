import { Set } from 'typescript-collections';
import { BinanceDeliveryAwakeHandler } from './handler/binance-delivery-awake.handler';
import { BinanceDeliveryAccountHandler } from './handler/binance-delivery-account.handler';
import { BinanceDeliverySubscribeHandler } from './handler/binance-delivery-subscribe.handler';
import {
  Instrument,
  InstrumentSelector,
  Adapter,
  PaperAdapter,
  PaperMarginModel,
  AdapterAwakeCommand,
  AdapterContext,
  handler,
  AdapterAccountCommand,
  AdapterSubscribeCommand
} from '@quantform/core';
const Binance = require('node-binance-api');

export class BinanceDeliveryAdapter extends Adapter {
  readonly name = 'binancedelivery';
  readonly endpoint: any;

  subscription = new Set<InstrumentSelector>();

  constructor(options?: { key: string; secret: string }) {
    super();

    this.endpoint = new Binance().options({
      APIKEY: options?.key ?? process.env.BINANCE_APIKEY,
      APISECRET: options?.secret ?? process.env.BINANCE_APISECRET
    });
  }

  createPaperModel(adapter: PaperAdapter) {
    return new PaperMarginModel(adapter);
  }

  translateAsset(asset: Instrument): string {
    return `${asset.base.name.toUpperCase()}${asset.quote.name.toUpperCase()}`;
  }

  @handler(AdapterAwakeCommand)
  onAwake(command: AdapterAwakeCommand, context: AdapterContext) {
    return BinanceDeliveryAwakeHandler(command, context, this);
  }

  @handler(AdapterAccountCommand)
  onAccount(command: AdapterAccountCommand, context: AdapterContext) {
    return BinanceDeliveryAccountHandler(command, context);
  }

  @handler(AdapterSubscribeCommand)
  onSubscribe(command: AdapterSubscribeCommand, context: AdapterContext) {
    return BinanceDeliverySubscribeHandler(command, context, this);
  }
}
