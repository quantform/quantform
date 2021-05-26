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
  PaperMarginModel
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

    this.register(AdapterAwakeRequest, new OandaAwakeHandler(this));
    this.register(AdapterAccountRequest, new OandaAccountHandler(this));
    this.register(AdapterSubscribeRequest, new OandaSubscribeHandler(this));
  }

  timestamp() {
    return now();
  }

  createPaperModel(adapter: PaperAdapter) {
    return new PaperMarginModel(adapter);
  }
}
