import { OandaSubscribeHandler } from './handlers/oanda-subscribe.handler';
import { Set } from 'typescript-collections';
import { OandaAccountHandler } from './handlers/oanda-account.handler';
import { OandaAwakeHandler } from './handlers/oanda-awake.handler';
import Oanda = require('@oanda/v20/context');
import {
  AssetSelector,
  AdapterAccountRequest,
  AdapterAwakeRequest,
  AdapterSubscribeRequest,
  Instrument,
  now,
  PaperAdapter,
  Adapter,
  PaperPlatformMargin
} from '@quantform/core';

export class OandaAdapter extends Adapter {
  public name = 'oanda';

  http = new Oanda.Context('api-fxpractice.oanda.com', 443, true, 'test');
  socket = new Oanda.Context('stream-fxpractice.oanda.com', 443, true, 'test');
  accountId = process.env.OANDA_ACCOUNTID;
  subscription = new Set<Instrument>();
  asset = new AssetSelector('eur', this.name);

  constructor() {
    super();

    this.http.setToken(process.env.OANDA_TOKEN);
    this.socket.setToken(process.env.OANDA_TOKEN);

    this.register(AdapterAwakeRequest, new OandaAwakeHandler(this));
    this.register(AdapterAccountRequest, new OandaAccountHandler(this));
    this.register(AdapterSubscribeRequest, new OandaSubscribeHandler(this));
  }

  timestamp() {
    return now();
  }

  createPaperPlatform(adapter: PaperAdapter) {
    return new PaperPlatformMargin(adapter);
  }
}
