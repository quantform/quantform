import { PaperOptions } from '.';
import { Adapter } from '..';
import {
  AdapterAccountRequest,
  AdapterAwakeRequest,
  AdapterHistoryRequest,
  AdapterOrderCancelRequest,
  AdapterOrderOpenRequest,
  AdapterSubscribeRequest,
  AdapterImportRequest
} from '../adapter-request';
import { Store } from '../../store';
import { PaperAccountHandler } from './handlers/paper-account.handler';
import { PaperAwakeHandler } from './handlers/paper-awake.handler';
import { PaperHistoryHandler } from './handlers/paper-history.handler';
import { PaperImportHandler } from './handlers/paper-import.handler';
import { PaperOrderCancelHandler } from './handlers/paper-order-cancel.handler';
import { PaperOrderOpenHandler } from './handlers/paper-order-open.handler';
import { PaperSubscribeHandler } from './handlers/paper-subscribe.handler';
import { PaperPlatform } from './platforms/paper-platform';

export class PaperAdapter extends Adapter {
  public name;

  readonly platform: PaperPlatform;

  timestamp() {
    return this.adapter.timestamp();
  }

  constructor(
    readonly adapter: Adapter,
    readonly store: Store,
    readonly options: PaperOptions
  ) {
    super();

    this.name = adapter.name;
    this.platform = this.createPaperPlatform(this);

    this.register(AdapterAwakeRequest, new PaperAwakeHandler(adapter));
    this.register(AdapterAccountRequest, new PaperAccountHandler(this));
    this.register(AdapterSubscribeRequest, new PaperSubscribeHandler(adapter));
    this.register(AdapterOrderOpenRequest, new PaperOrderOpenHandler(this));
    this.register(AdapterOrderCancelRequest, new PaperOrderCancelHandler(this));
    this.register(AdapterHistoryRequest, new PaperHistoryHandler(adapter));
    this.register(AdapterImportRequest, new PaperImportHandler(adapter));
  }

  createPaperPlatform(adapter: PaperAdapter): PaperPlatform {
    return this.adapter.createPaperPlatform(adapter);
  }
}
