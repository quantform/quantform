import { Set } from 'typescript-collections';
import Binance = require('node-binance-api');
import {
  InstrumentSelector,
  Adapter,
  PaperAdapter,
  PaperSpotModel,
  handler,
  AdapterAwakeCommand,
  AdapterAccountCommand,
  AdapterSubscribeCommand,
  AdapterOrderOpenCommand,
  AdapterOrderCancelCommand,
  AdapterHistoryQuery,
  AdapterImportCommand,
  AdapterContext
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
  }

  createPaperModel(adapter: PaperAdapter) {
    return new PaperSpotModel(adapter);
  }

  @handler(AdapterAwakeCommand)
  async onAwake(command: AdapterAwakeCommand, context: AdapterContext) {
    return BinanceAwakeHandler(command, context, this);
  }

  @handler(AdapterAccountCommand)
  async onAccount(command: AdapterAwakeCommand, context: AdapterContext) {}

  @handler(AdapterSubscribeCommand)
  async onSubscribe(command: AdapterSubscribeCommand, context: AdapterContext) {}

  @handler(AdapterOrderOpenCommand)
  async onOrderOpen(command: AdapterOrderOpenCommand, context: AdapterContext) {}

  @handler(AdapterOrderCancelCommand)
  async onOrderCancel(command: AdapterOrderCancelCommand, context: AdapterContext) {}

  @handler(AdapterHistoryQuery)
  async onHistory(query: AdapterHistoryQuery, context: AdapterContext) {}

  @handler(AdapterImportCommand)
  async onImport(command: AdapterImportCommand, context: AdapterContext) {}
}
