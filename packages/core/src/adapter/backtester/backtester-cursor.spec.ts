import { Candle, instrumentOf } from '../../domain';
import { d } from '../../shared';
import { Feed, InMemoryStorage } from '../../storage';
import { BacktesterCursor } from './backtester-cursor';

describe('BacktesterCursor', () => {
  test('should repeat specific events', async () => {
    const instrument = instrumentOf('binance:btc-usdt');
    const feed = new Feed(new InMemoryStorage());
    const cursor = new BacktesterCursor(instrument, feed);

    feed.save(instrument, [
      new Candle(1, d(1), d(1), d(1), d(1)),
      new Candle(2, d(2), d(2), d(2), d(2)),
      new Candle(3, d(3), d(3), d(3), d(3)),
      new Candle(4, d(4), d(4), d(4), d(4)),
      new Candle(5, d(5), d(5), d(5), d(5)),
      new Candle(6, d(6), d(6), d(6), d(6)),
      new Candle(7, d(7), d(7), d(7), d(7)),
      new Candle(8, d(8), d(8), d(8), d(8))
    ]);

    await cursor.fetchNextPage(0, 4);

    expect(cursor.dequeue().open).toEqual(d(1));
    expect(cursor.dequeue().open).toEqual(d(2));
    expect(cursor.dequeue().open).toEqual(d(3));
    expect(cursor.peek()).toEqual(undefined);

    await cursor.fetchNextPage(3, 7);

    expect(cursor.dequeue().open).toEqual(d(4));
    expect(cursor.dequeue().open).toEqual(d(5));
    expect(cursor.dequeue().open).toEqual(d(6));
    expect(cursor.peek()).toEqual(undefined);

    await cursor.fetchNextPage(6, 10);

    expect(cursor.dequeue().open).toEqual(d(7));
    expect(cursor.dequeue().open).toEqual(d(8));
    expect(cursor.peek()).toEqual(undefined);
  });
});
