import { ExchangeXtbAwakeHandler } from './handlers/exchange-xtb-awake.handler';
import { ExchangeXtbSubscribeHandler } from './handlers/exchange-xtb-subscribe.handler';
import { ExchangeXtbImportHandler } from './handlers/exchange-xtb-import.handler';
import { ExchangeXtbDisposeHandler } from './handlers/exchange-xtb-dispose.handler';
import { ExchangeXtbHistoryHandler } from './handlers/exchange-xtb-history.handler';
import XAPI from 'xapi-node';
import {
  AdapterAwakeRequest,
  ExchangeDisposeRequest,
  AdapterHistoryRequest,
  AdapterImportRequest,
  ExchangeMarginAdapter,
  AdapterSubscribeRequest,
  now
} from '@quantform/core';

export class ExchangeXtbAdapter extends ExchangeMarginAdapter {
  public name = 'xtb';

  endpoint = new XAPI({
    accountId: process.env.XTB_ACCOUNT_ID,
    password: process.env.XTB_PASSWORD,
    type: 'demo'
  });

  timestamp() {
    return now();
  }

  constructor() {
    super();

    this.register(AdapterAwakeRequest, new ExchangeXtbAwakeHandler(this));
    this.register(ExchangeDisposeRequest, new ExchangeXtbDisposeHandler(this));
    this.register(AdapterSubscribeRequest, new ExchangeXtbSubscribeHandler(this));
    this.register(AdapterHistoryRequest, new ExchangeXtbHistoryHandler(this));
    this.register(AdapterImportRequest, new ExchangeXtbImportHandler(this));
  }

  async dispose(): Promise<void> {
    await this.endpoint.disconnect();
  }
}
