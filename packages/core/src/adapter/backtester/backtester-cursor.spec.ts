import { BacktesterCursor } from '@lib/adapter';
import { instrumentOf, TradePatchEvent } from '@lib/component';
import { d } from '@lib/shared';
import { Feed, InMemoryStorageFactory } from '@lib/storage';

describe(BacktesterCursor.name, () => {
  test('should repeat specific events', async () => {
    const instrument = instrumentOf('binance:btc-usdt');
    const feed = new Feed(new InMemoryStorageFactory());
    const cursor = new BacktesterCursor(instrument, feed);

    feed.save([
      new TradePatchEvent(instrument, d(1), d(1), 1),
      new TradePatchEvent(instrument, d(2), d(2), 2),
      new TradePatchEvent(instrument, d(3), d(3), 3),
      new TradePatchEvent(instrument, d(4), d(4), 4),
      new TradePatchEvent(instrument, d(5), d(5), 5),
      new TradePatchEvent(instrument, d(6), d(6), 6),
      new TradePatchEvent(instrument, d(7), d(7), 7),
      new TradePatchEvent(instrument, d(8), d(8), 8)
    ]);

    await cursor.fetchNextPage(0, 4);

    expect(cursor.dequeue()).toEqual(new TradePatchEvent(instrument, d(1), d(1), 1));
    expect(cursor.dequeue()).toEqual(new TradePatchEvent(instrument, d(2), d(2), 2));
    expect(cursor.dequeue()).toEqual(new TradePatchEvent(instrument, d(3), d(3), 3));
    expect(cursor.peek()).toEqual(undefined);

    await cursor.fetchNextPage(3, 7);

    expect(cursor.dequeue()).toEqual(new TradePatchEvent(instrument, d(4), d(4), 4));
    expect(cursor.dequeue()).toEqual(new TradePatchEvent(instrument, d(5), d(5), 5));
    expect(cursor.dequeue()).toEqual(new TradePatchEvent(instrument, d(6), d(6), 6));
    expect(cursor.peek()).toEqual(undefined);

    await cursor.fetchNextPage(6, 10);

    expect(cursor.dequeue()).toEqual(new TradePatchEvent(instrument, d(7), d(7), 7));
    expect(cursor.dequeue()).toEqual(new TradePatchEvent(instrument, d(8), d(8), 8));
    expect(cursor.peek()).toEqual(undefined);
  });
});
