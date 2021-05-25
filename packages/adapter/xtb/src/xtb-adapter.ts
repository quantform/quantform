import { XtbAwakeHandler } from './handlers/xtb-awake.handler';
import { XtbSubscribeHandler } from './handlers/xtb-subscribe.handler';
import { XtbImportHandler } from './handlers/xtb-import.handler';
import { XtbDisposeHandler } from './handlers/xtb-dispose.handler';
import { XtbHistoryHandler } from './handlers/xtb-history.handler';
import XAPI from 'xapi-node';
import {
  AdapterAwakeRequest,
  AdapterDisposeRequest,
  AdapterHistoryRequest,
  AdapterImportRequest,
  MarginAdapter,
  AdapterSubscribeRequest,
  now
} from '@quantform/core';

export class XtbAdapter extends MarginAdapter {
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

    this.register(AdapterAwakeRequest, new XtbAwakeHandler(this));
    this.register(AdapterDisposeRequest, new XtbDisposeHandler(this));
    this.register(AdapterSubscribeRequest, new XtbSubscribeHandler(this));
    this.register(AdapterHistoryRequest, new XtbHistoryHandler(this));
    this.register(AdapterImportRequest, new XtbImportHandler(this));
  }
}
