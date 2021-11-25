import { DukascopyHistoryHandler } from './handlers/dukascopy-history.handler';
import { DukascopyAwakeHandler } from './handlers/dukascopy-awake.handler';
import { DukascopyFeedHandler } from './handlers/dukascopy-feed.handler';
import {
  Adapter,
  AdapterAwakeCommand,
  AdapterContext,
  AdapterFeedCommand,
  AdapterHistoryQuery,
  handler,
  PaperAdapter,
  PaperMarginExecutor
} from '@quantform/core';

export class DukascopyAdapter extends Adapter {
  readonly name = 'dukascopy';

  createPaperExecutor(adapter: PaperAdapter) {
    return new PaperMarginExecutor(adapter);
  }

  @handler(AdapterAwakeCommand)
  onAwake(command: AdapterAwakeCommand, context: AdapterContext) {
    return DukascopyAwakeHandler(command, context, this);
  }

  @handler(AdapterFeedCommand)
  onFeed(command: AdapterFeedCommand, context: AdapterContext) {
    return DukascopyFeedHandler(command, context);
  }

  @handler(AdapterHistoryQuery)
  on(command: AdapterHistoryQuery, context: AdapterContext) {
    return DukascopyHistoryHandler(command, context, this);
  }
}
