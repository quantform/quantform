import { DukascopyHistoryHandler } from './handlers/dukascopy-history.handler';
import { DukascopyAwakeHandler } from './handlers/dukascopy-awake.handler';
import { DukascopyImportHandler } from './handlers/dukascopy-import.handler';
import {
  Adapter,
  AdapterAwakeRequest,
  AdapterHistoryRequest,
  AdapterImportRequest,
  now,
  PaperAdapter,
  PaperPlatformMargin
} from '@quantform/core';

export class DukascopyAdapter extends Adapter {
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

  createPaperPlatform(adapter: PaperAdapter) {
    return new PaperPlatformMargin(adapter);
  }
}
