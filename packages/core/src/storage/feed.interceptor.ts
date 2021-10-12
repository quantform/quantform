import { InstrumentSelector } from '../domain';
import { StoreEvent, OrderbookPatchEvent, TradePatchEvent } from '../store/event';
import { Feed } from './feed';

export abstract class FeedInterceptor implements Feed {
  constructor(private readonly feed: Feed) {}

  abstract intercept(
    instrument: InstrumentSelector,
    event: StoreEvent
  ): StoreEvent | StoreEvent[];

  async read(
    instrument: InstrumentSelector,
    from: number,
    to: number
  ): Promise<StoreEvent[]> {
    const output = new Array<StoreEvent>();

    for (const event of await this.feed.read(instrument, from, to)) {
      const intercepted = this.intercept(instrument, event);

      if (!intercepted) {
        continue;
      }

      if (Array.isArray(intercepted)) {
        output.push(...intercepted);
      } else {
        output.push(intercepted);
      }
    }

    return output;
  }

  write(instrument: InstrumentSelector, events: StoreEvent[]): Promise<void> {
    return this.feed.write(instrument, events);
  }
}

class FeedCandleInterceptor extends FeedInterceptor {
  constructor(
    feed: Feed,
    private readonly options: {
      orderbook: boolean;
      trade: boolean;
    }
  ) {
    super(feed);
  }

  intercept(
    instrument: InstrumentSelector,
    event: StoreEvent & any
  ): StoreEvent | StoreEvent[] {
    const output = [];

    if (event.type == 'candle') {
      if (this.options.orderbook) {
        output.push(
          new OrderbookPatchEvent(
            instrument,
            event.close, // + instrument.quote.tickSize,
            0,
            event.close, // - instrument.quote.tickSize,
            0,
            event.timestamp
          )
        );
      }

      if (this.options.trade) {
        output.push(
          new TradePatchEvent(event.instrument, event.close, 0, event.timestamp)
        );
      }

      return output;
    }
  }
}

export function fromCandle(
  feed: Feed,
  options: {
    orderbook: boolean;
    trade: boolean;
  }
): Feed {
  return new FeedCandleInterceptor(feed, options);
}
