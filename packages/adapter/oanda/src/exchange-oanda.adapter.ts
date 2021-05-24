import { ExchangeOandaSubscribeHandler } from './handlers/exchange-oanda-subscribe.handler';
import { Set } from 'typescript-collections';
import { ExchangeOandaAccountHandler } from './handlers/exchange-oanda-account.handler';
import { ExchangeOandaAwakeHandler } from './handlers/exchange-oanda-awake.handler';
import Oanda = require('@oanda/v20/context');
import {
  AssetSelector,
  AdapterAccountRequest,
  AdapterAwakeRequest,
  ExchangeMarginAdapter,
  AdapterSubscribeRequest,
  Instrument,
  now
} from '@quantform/core';

export class ExchangeOandaAdapter extends ExchangeMarginAdapter {
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

    this.register(AdapterAwakeRequest, new ExchangeOandaAwakeHandler(this));
    this.register(AdapterAccountRequest, new ExchangeOandaAccountHandler(this));
    this.register(AdapterSubscribeRequest, new ExchangeOandaSubscribeHandler(this));
  }

  timestamp() {
    return now();
  }
}
