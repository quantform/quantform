import { ExchangeDukascopyHistoryHandler } from './handlers/exchange-dukascopy-history.handler';
import { ExchangeDukascopyAwakeHandler } from './handlers/exchange-dukascopy-awake.handler';
import { ExchangeDukascopyImportHandler } from './handlers/exchange-dukascopy-import.handler';
import {
  ExchangeAwakeRequest,
  ExchangeHistoryRequest,
  ExchangeImportRequest,
  ExchangeMarginAdapter,
  now
} from '@quantform/core';

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
