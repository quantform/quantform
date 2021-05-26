import { DukascopyHistoryHandler } from './handlers/dukascopy-history.handler';
import { DukascopyAwakeHandler } from './handlers/dukascopy-awake.handler';
import { DukascopyImportHandler } from './handlers/dukascopy-import.handler';
import {
  Adapter,
  AdapterAwakeRequest,
  AdapterHistoryRequest,
  AdapterImportRequest,
  PaperAdapter,
  PaperMarginModel
} from '@quantform/core';

export class DukascopyAdapter extends Adapter {
  readonly name = 'dukascopy';

  constructor() {
    super();

    this.register(AdapterAwakeRequest, new DukascopyAwakeHandler());
    this.register(AdapterHistoryRequest, new DukascopyHistoryHandler(this));
    this.register(AdapterImportRequest, new DukascopyImportHandler());
  }

  createPaperModel(adapter: PaperAdapter) {
    return new PaperMarginModel(adapter);
  }
}
