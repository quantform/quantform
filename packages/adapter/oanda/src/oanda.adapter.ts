import { OandaSubscribeHandler } from './handlers/oanda-subscribe.handler';
import { Set } from 'typescript-collections';
import { OandaAccountHandler } from './handlers/oanda-account.handler';
import { OandaAwakeHandler } from './handlers/oanda-awake.handler';
import Oanda = require('@oanda/v20/context');
import {
  AssetSelector,
  Instrument,
  PaperAdapter,
  Adapter,
  PaperMarginExecutor,
  AdapterAccountCommand,
  AdapterContext,
  handler,
  AdapterAwakeCommand,
  AdapterSubscribeCommand
} from '@quantform/core';

export class OandaAdapter extends Adapter {
  readonly name = 'oanda';
  readonly http = new Oanda.Context('api-fxpractice.oanda.com', 443, true, 'test');
  readonly socket = new Oanda.Context('stream-fxpractice.oanda.com', 443, true, 'test');
  readonly accountId: string;

  subscription = new Set<Instrument>();
  asset = new AssetSelector('eur', this.name);

  constructor(options?: { accountId: string }) {
    super();

    this.accountId = options?.accountId ?? process.env.OANDA_ACCOUNTID;

    this.http.setToken(process.env.OANDA_TOKEN);
    this.socket.setToken(process.env.OANDA_TOKEN);
  }

  createPaperExecutor(adapter: PaperAdapter) {
    return new PaperMarginExecutor(adapter);
  }

  @handler(AdapterAwakeCommand)
  onAwake(command: AdapterAwakeCommand, context: AdapterContext) {
    return OandaAwakeHandler(command, context, this);
  }

  @handler(AdapterAccountCommand)
  onAccount(command: AdapterAccountCommand, context: AdapterContext) {
    return OandaAccountHandler(command, context, this);
  }

  @handler(AdapterSubscribeCommand)
  onSubscribe(command: AdapterSubscribeCommand, context: AdapterContext) {
    return OandaSubscribeHandler(command, context, this);
  }
}
