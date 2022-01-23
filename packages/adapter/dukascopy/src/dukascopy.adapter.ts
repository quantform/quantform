import { DukascopyHistoryHandler } from './handlers/dukascopy-history.handler';
import { DukascopyAwakeHandler } from './handlers/dukascopy-awake.handler';
import { DukascopyFeedHandler } from './handlers/dukascopy-feed.handler';
import {
  Adapter,
  AdapterContext,
  Candle,
  FeedQuery,
  HistoryQuery,
  PaperAdapter,
  PaperMarginSimulator
} from '@quantform/core';

export class DukascopyAdapter extends Adapter {
  readonly name = 'dukascopy';

  createPaperSimulator(adapter: PaperAdapter) {
    return new PaperMarginSimulator(adapter);
  }

  async awake(context: AdapterContext): Promise<void> {
    await super.awake(context);
    await DukascopyAwakeHandler(context, this);
  }

  feed(query: FeedQuery): Promise<void> {
    return DukascopyFeedHandler(query, this.context);
  }

  history(query: HistoryQuery): Promise<Candle[]> {
    return DukascopyHistoryHandler(query, this.context, this);
  }
}
