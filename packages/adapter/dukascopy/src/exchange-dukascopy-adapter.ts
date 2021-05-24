import { ExchangeDukascopyHistoryHandler } from './handlers/exchange-dukascopy-history.handler';
import { ExchangeDukascopyAwakeHandler } from './handlers/exchange-dukascopy-awake.handler';
import { ExchangeDukascopyImportHandler } from './handlers/exchange-dukascopy-import.handler';
import {
  AdapterAwakeRequest,
  AdapterHistoryRequest,
  AdapterImportRequest,
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

    this.register(AdapterAwakeRequest, new ExchangeDukascopyAwakeHandler());
    this.register(AdapterHistoryRequest, new ExchangeDukascopyHistoryHandler(this));
    this.register(AdapterImportRequest, new ExchangeDukascopyImportHandler());
  }
}
