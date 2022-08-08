import { Candle, instrumentOf } from '../../domain';
import { decimal } from '../../shared';
import { Feed, InMemoryStorage } from '../../storage';
import { BacktesterCursor } from './backtester-cursor';

describe('BacktesterCursor', () => {
  test('should repeat specific events', async () => {
    const instrument = instrumentOf('binance:btc-usdt');
    const feed = new Feed(new InMemoryStorage());
    const cursor = new BacktesterCursor(instrument, feed);

    feed.save(instrument, [
      new Candle(1, new decimal(1), new decimal(1), new decimal(1), new decimal(1)),
      new Candle(2, new decimal(2), new decimal(2), new decimal(2), new decimal(2)),
      new Candle(3, new decimal(3), new decimal(3), new decimal(3), new decimal(3)),
      new Candle(4, new decimal(4), new decimal(4), new decimal(4), new decimal(4)),
      new Candle(5, new decimal(5), new decimal(5), new decimal(5), new decimal(5)),
      new Candle(6, new decimal(6), new decimal(6), new decimal(6), new decimal(6)),
      new Candle(7, new decimal(7), new decimal(7), new decimal(7), new decimal(7)),
      new Candle(8, new decimal(8), new decimal(8), new decimal(8), new decimal(8))
    ]);

    await cursor.fetchNextPage(0, 4);

    expect(cursor.dequeue().open).toEqual(new decimal(1));
    expect(cursor.dequeue().open).toEqual(new decimal(2));
    expect(cursor.dequeue().open).toEqual(new decimal(3));
    expect(cursor.peek()).toEqual(undefined);

    await cursor.fetchNextPage(3, 7);

    expect(cursor.dequeue().open).toEqual(new decimal(4));
    expect(cursor.dequeue().open).toEqual(new decimal(5));
    expect(cursor.dequeue().open).toEqual(new decimal(6));
    expect(cursor.peek()).toEqual(undefined);

    await cursor.fetchNextPage(6, 10);

    expect(cursor.dequeue().open).toEqual(new decimal(7));
    expect(cursor.dequeue().open).toEqual(new decimal(8));
    expect(cursor.peek()).toEqual(undefined);
  });
});
