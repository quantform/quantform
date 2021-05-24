import { DukascopyHistoryHandler } from './handlers/dukascopy-history.handler';
import { DukascopyAwakeHandler } from './handlers/dukascopy-awake.handler';
import { DukascopyImportHandler } from './handlers/dukascopy-import.handler';
import {
  AdapterAwakeRequest,
  AdapterHistoryRequest,
  AdapterImportRequest,
  MarginAdapter,
  now
} from '@quantform/core';

export class DukascopyAdapter extends MarginAdapter {
  public name = 'dukascopy';

  timestamp() {
    return now();
  }

  constructor() {
    super();

    this.register(AdapterAwakeRequest, new DukascopyAwakeHandler());
    this.register(AdapterHistoryRequest, new DukascopyHistoryHandler(this));
    this.register(AdapterImportRequest, new DukascopyImportHandler());
  }
}
