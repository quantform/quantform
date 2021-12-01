import { XtbAwakeHandler } from './handlers/xtb-awake.handler';
import { XtbSubscribeHandler } from './handlers/xtb-subscribe.handler';
import { XtbDisposeHandler } from './handlers/xtb-dispose.handler';
import { XtbHistoryHandler } from './handlers/xtb-history.handler';
import XAPI, { ListenerChild } from 'xapi-node';
import {
  Adapter,
  AdapterAwakeCommand,
  AdapterContext,
  AdapterDisposeCommand,
  AdapterFeedCommand,
  AdapterHistoryQuery,
  AdapterSubscribeCommand,
  handler,
  Instrument,
  PaperAdapter,
  PaperMarginExecutor
} from '@quantform/core';
import { XtbFeedHandler } from './handlers/xtb-feed.handler';

export class XtbAdapter extends Adapter {
  readonly name = 'xtb';
  readonly endpoint: XAPI;
  listener: ListenerChild;
  readonly mapper: { [raw: string]: Instrument } = {};

  constructor(options?: { accountId: string; password: string; type: string }) {
    super();

    this.endpoint = new XAPI({
      accountId: options?.accountId ?? process.env.QF_XTB_ACCOUNT_ID,
      password: options?.password ?? process.env.QF_XTB_PASSWORD,
      type: options?.type ?? 'demo'
    });
  }

  createPaperExecutor(adapter: PaperAdapter) {
    return new PaperMarginExecutor(adapter);
  }

  @handler(AdapterAwakeCommand)
  onAwake(command: AdapterAwakeCommand, context: AdapterContext) {
    return XtbAwakeHandler(command, context, this);
  }

  @handler(AdapterDisposeCommand)
  onDispose(command: AdapterDisposeCommand, context: AdapterContext) {
    return XtbDisposeHandler(command, context, this);
  }

  @handler(AdapterSubscribeCommand)
  onSubscribe(command: AdapterSubscribeCommand, context: AdapterContext) {
    return XtbSubscribeHandler(command, context, this);
  }

  @handler(AdapterHistoryQuery)
  onhistory(query: AdapterHistoryQuery, context: AdapterContext) {
    return XtbHistoryHandler(query, context, this);
  }

  @handler(AdapterFeedCommand)
  onFeed(command: AdapterFeedCommand, context: AdapterContext) {
    return XtbFeedHandler(command, context, this);
  }
}
