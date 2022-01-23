import { Set } from 'typescript-collections';
import { BinanceDeliveryAwakeHandler } from './handler/binance-delivery-awake.handler';
import { BinanceDeliveryAccountHandler } from './handler/binance-delivery-account.handler';
import { BinanceDeliverySubscribeHandler } from './handler/binance-delivery-subscribe.handler';
import {
  Instrument,
  InstrumentSelector,
  Adapter,
  PaperAdapter,
  PaperMarginSimulator,
  AdapterContext
} from '@quantform/core';
const Binance = require('node-binance-api');

export class BinanceDeliveryAdapter extends Adapter {
  readonly name = 'binancedelivery';
  readonly endpoint: any;

  subscription = new Set<InstrumentSelector>();

  constructor(options?: { key: string; secret: string }) {
    super();

    this.endpoint = new Binance().options({
      APIKEY: options?.key ?? process.env.QF_BINANCEDELIVERY_APIKEY,
      APISECRET: options?.secret ?? process.env.QF_BINANCEDELIVERY_APISECRET
    });
  }

  createPaperSimulator(adapter: PaperAdapter) {
    return new PaperMarginSimulator(adapter);
  }

  translateAsset(asset: Instrument): string {
    return `${asset.base.name.toUpperCase()}${asset.quote.name.toUpperCase()}`;
  }

  async awake(context: AdapterContext): Promise<void> {
    await super.awake(context);
    await BinanceDeliveryAwakeHandler(context, this);
  }

  async account(): Promise<void> {
    BinanceDeliveryAccountHandler(this.context);
  }

  subscribe(instruments: InstrumentSelector[]): Promise<void> {
    return BinanceDeliverySubscribeHandler(instruments, this.context, this);
  }
}
