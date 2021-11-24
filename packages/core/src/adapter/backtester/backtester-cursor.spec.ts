import { instrumentOf } from '../../domain';
import { Feed, InMemoryStorage } from '../../storage';
import { TradePatchEvent } from '../../store/event';
import { BacktesterCursor } from './backtester-cursor';

describe('backtester cursor tests', () => {
  test('should reapeat specific events', async () => {
    const instrument = instrumentOf('binance:btc-usdt');
    const feed = new Feed(new InMemoryStorage());
    const cursor = new BacktesterCursor(instrument, feed);

    feed.save(instrument, [
      new TradePatchEvent(instrument, 1, 1, 1),
      new TradePatchEvent(instrument, 2, 1, 2),
      new TradePatchEvent(instrument, 3, 1, 3),
      new TradePatchEvent(instrument, 4, 1, 4),
      new TradePatchEvent(instrument, 5, 1, 5),
      new TradePatchEvent(instrument, 6, 1, 6),
      new TradePatchEvent(instrument, 7, 1, 7),
      new TradePatchEvent(instrument, 8, 1, 8)
    ]);

    await cursor.fetchNextPage(0, 4);

    expect(cursor.dequeue().rate).toEqual(1);
    expect(cursor.dequeue().rate).toEqual(2);
    expect(cursor.dequeue().rate).toEqual(3);
    expect(cursor.peek()).toEqual(undefined);

    await cursor.fetchNextPage(3, 7);

    expect(cursor.dequeue().rate).toEqual(4);
    expect(cursor.dequeue().rate).toEqual(5);
    expect(cursor.dequeue().rate).toEqual(6);
    expect(cursor.peek()).toEqual(undefined);

    await cursor.fetchNextPage(6, 10);

    expect(cursor.dequeue().rate).toEqual(7);
    expect(cursor.dequeue().rate).toEqual(8);
    expect(cursor.peek()).toEqual(undefined);
  });
});
