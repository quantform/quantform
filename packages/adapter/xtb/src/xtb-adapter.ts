import { XtbAwakeHandler } from './handlers/xtb-awake.handler';
import { XtbSubscribeHandler } from './handlers/xtb-subscribe.handler';
import { XtbDisposeHandler } from './handlers/xtb-dispose.handler';
import { XtbHistoryHandler } from './handlers/xtb-history.handler';
import XAPI, { ListenerChild } from 'xapi-node';
import {
  Adapter,
  AdapterContext,
  Candle,
  FeedQuery,
  HistoryQuery,
  Instrument,
  InstrumentSelector,
  PaperAdapter,
  PaperMarginSimulator
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

  createPaperSimulator(adapter: PaperAdapter) {
    return new PaperMarginSimulator(adapter);
  }

  async awake(context: AdapterContext): Promise<void> {
    await super.awake(context);
    await XtbAwakeHandler(context, this);
  }

  dispose(): Promise<void> {
    return XtbDisposeHandler(this.context, this);
  }

  subscribe(instruments: InstrumentSelector[]): Promise<void> {
    return XtbSubscribeHandler(instruments, this.context, this);
  }

  history(query: HistoryQuery): Promise<Candle[]> {
    return XtbHistoryHandler(query, this.context, this);
  }

  feed(query: FeedQuery): Promise<void> {
    return XtbFeedHandler(query, this.context, this);
  }
}
