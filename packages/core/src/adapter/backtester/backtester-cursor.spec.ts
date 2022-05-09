import { Candle, instrumentOf } from '../../domain';
import { Feed, InMemoryStorage } from '../../storage';
import { BacktesterCursor } from './backtester-cursor';

describe('BacktesterCursor', () => {
  test('should repeat specific events', async () => {
    const instrument = instrumentOf('binance:btc-usdt');
    const feed = new Feed(new InMemoryStorage());
    const cursor = new BacktesterCursor(instrument, feed);

    feed.save(instrument, [
      new Candle(1, 1, 1, 1, 1),
      new Candle(2, 2, 2, 2, 2),
      new Candle(3, 3, 3, 3, 3),
      new Candle(4, 4, 4, 4, 4),
      new Candle(5, 5, 5, 5, 5),
      new Candle(6, 6, 6, 6, 6),
      new Candle(7, 7, 7, 7, 7),
      new Candle(8, 8, 8, 8, 8)
    ]);

    await cursor.fetchNextPage(0, 4);

    expect(cursor.dequeue().open).toEqual(1);
    expect(cursor.dequeue().open).toEqual(2);
    expect(cursor.dequeue().open).toEqual(3);
    expect(cursor.peek()).toEqual(undefined);

    await cursor.fetchNextPage(3, 7);

    expect(cursor.dequeue().open).toEqual(4);
    expect(cursor.dequeue().open).toEqual(5);
    expect(cursor.dequeue().open).toEqual(6);
    expect(cursor.peek()).toEqual(undefined);

    await cursor.fetchNextPage(6, 10);

    expect(cursor.dequeue().open).toEqual(7);
    expect(cursor.dequeue().open).toEqual(8);
    expect(cursor.peek()).toEqual(undefined);
  });
});
