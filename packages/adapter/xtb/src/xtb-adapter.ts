import { XtbAwakeHandler } from './handlers/xtb-awake.handler';
import { XtbSubscribeHandler } from './handlers/xtb-subscribe.handler';
import { XtbImportHandler } from './handlers/xtb-import.handler';
import { XtbDisposeHandler } from './handlers/xtb-dispose.handler';
import { XtbHistoryHandler } from './handlers/xtb-history.handler';
import XAPI from 'xapi-node';
import {
  Adapter,
  AdapterAwakeRequest,
  AdapterDisposeRequest,
  AdapterHistoryRequest,
  AdapterImportRequest,
  AdapterSubscribeRequest,
  now,
  PaperAdapter,
  PaperSpotModel
} from '@quantform/core';

export class XtbAdapter extends Adapter {
  readonly name = 'xtb';
  readonly endpoint: XAPI;

  timestamp() {
    return now();
  }

  constructor(options?: { accountId: string; password: string; type: string }) {
    super();

    this.endpoint = new XAPI({
      accountId: options?.accountId ?? process.env.XTB_ACCOUNT_ID,
      password: options?.password ?? process.env.XTB_PASSWORD,
      type: options?.type ?? 'demo'
    });

    this.register(AdapterAwakeRequest, new XtbAwakeHandler(this));
    this.register(AdapterDisposeRequest, new XtbDisposeHandler(this));
    this.register(AdapterSubscribeRequest, new XtbSubscribeHandler(this));
    this.register(AdapterHistoryRequest, new XtbHistoryHandler(this));
    this.register(AdapterImportRequest, new XtbImportHandler(this));
  }

  createPaperModel(adapter: PaperAdapter) {
    return new PaperSpotModel(adapter);
  }
}
