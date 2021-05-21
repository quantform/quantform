import { AssetSelector, Instrument } from '../domain';
import { ExchangeMarginAdapter } from '../exchange-adapter/exchange-adapter';
import { ExchangeOandaSubscribeHandler } from './handlers/exchange-oanda-subscribe.handler';
import { Set } from 'typescript-collections';
import { ExchangeOandaAccountHandler } from './handlers/exchange-oanda-account.handler';
import { ExchangeOandaAwakeHandler } from './handlers/exchange-oanda-awake.handler';
import Oanda = require('@oanda/v20/context');
import {
  ExchangeAccountRequest,
  ExchangeAwakeRequest,
  ExchangeSubscribeRequest
} from '../exchange-adapter/exchange-adapter-request';
import { now } from '../common';

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

    this.register(ExchangeAwakeRequest, new ExchangeOandaAwakeHandler(this));
    this.register(ExchangeAccountRequest, new ExchangeOandaAccountHandler(this));
    this.register(ExchangeSubscribeRequest, new ExchangeOandaSubscribeHandler(this));
  }

  timestamp() {
    return now();
  }
}
