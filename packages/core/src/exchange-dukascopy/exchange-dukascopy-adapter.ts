import { ExchangeMarginAdapter } from '../exchange-adapter/exchange-adapter';
import { ExchangeDukascopyHistoryHandler } from './handlers/exchange-dukascopy-history.handler';
import { ExchangeDukascopyAwakeHandler } from './handlers/exchange-dukascopy-awake.handler';
import {
  ExchangeAwakeRequest,
  ExchangeHistoryRequest,
  ExchangeImportRequest
} from '../exchange-adapter/exchange-adapter-request';
import { ExchangeDukascopyImportHandler } from './handlers/exchange-dukascopy-import.handler';
import { now } from '../common';

export class ExchangeDukascopyAdapter extends ExchangeMarginAdapter {
  public name = 'dukascopy';

  timestamp() {
    return now();
  }

  constructor() {
    super();

    this.register(ExchangeAwakeRequest, new ExchangeDukascopyAwakeHandler());
    this.register(ExchangeHistoryRequest, new ExchangeDukascopyHistoryHandler(this));
    this.register(ExchangeImportRequest, new ExchangeDukascopyImportHandler());
  }
}
