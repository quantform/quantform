import {
  Asset,
  BacktesterStreamer,
  Candle,
  Feed,
  Instrument,
  Store
} from '@quantform/core';
import { existsSync, unlinkSync } from 'fs';

import { SQLiteStorage } from './sqlite-storage';

describe('sqlite feed tests', () => {
  const dbName = 'test.db';
  const instrument = new Instrument(
    new Asset('btc', 'binance', 8),
    new Asset('usdt', 'binance', 2),
    ''
  );

  afterEach(() => {
    if (existsSync(dbName)) {
      unlinkSync(dbName);
    }
  });

  test('should create db file in user directory', async () => {
    const feed = new Feed(new SQLiteStorage(dbName));

    const input = [
      new Candle(
        1616175004063,
        1234.56789,
        1234.56789,
        1234.56789,
        1234.56789,
        1.12345678
      )
    ];

    await feed.save(instrument, input);

    const output = await feed.query(instrument, {
      from: 1616175004062,
      to: 1616234152109,
      count: 100
    });

    expect(output.length).toBe(1);
  });

  test('should insert multiple rows', async () => {
    const feed = new Feed(new SQLiteStorage(dbName));

    const input = [
      new Candle(
        1616175004063,
        1234.56789,
        1234.56789,
        1234.56789,
        1234.56789,
        1.12345678
      ),
      new Candle(
        1616221874143,
        1234.56789,
        1234.56789,
        1234.56789,
        1234.56789,
        2.12345678
      ),
      new Candle(
        1616234152108,
        1234.56789,
        1234.56789,
        1234.56789,
        1234.56789,
        3.12345678
      )
    ];

    await feed.save(instrument, input);

    const output = await feed.query(instrument, {
      from: 1616175004062,
      to: 1616234152109,
      count: 100
    });

    expect(output.length).toBe(3);

    for (let i = 0; i < 3; i++) {
      expect(output[i].timestamp).toBe(input[i].timestamp);
      expect(output[i].open).toBe(input[i].open);
      expect(output[i].volume).toBe(input[i].volume);
    }
  });

  test('should limit result', async () => {
    const feed = new Feed(new SQLiteStorage(dbName));

    const input = [
      new Candle(
        1616175004063,
        1234.56789,
        1234.56789,
        1234.56789,
        1234.56789,
        1.12345678
      ),
      new Candle(
        1616221874143,
        1234.56789,
        1234.56789,
        1234.56789,
        1234.56789,
        2.12345678
      ),
      new Candle(
        1616234152108,
        1234.56789,
        1234.56789,
        1234.56789,
        1234.56789,
        3.12345678
      )
    ];

    await feed.save(instrument, input);

    const output = await feed.query(instrument, {
      from: 1616175004062,
      to: 1616234152109,
      count: 2
    });

    expect(output.length).toBe(2);
    expect(output[0].timestamp).toBe(input[0].timestamp);
    expect(output[1].timestamp).toBe(input[1].timestamp);
  });

  test('should override duplicated rows', async () => {
    const feed = new Feed(new SQLiteStorage(dbName));

    await feed.save(instrument, [
      new Candle(
        1616175004063,
        1234.56789,
        1234.56789,
        1234.56789,
        1234.56789,
        1.12345678
      ),
      new Candle(
        1616175004063,
        1234.56789,
        1234.56789,
        1234.56789,
        1234.56789,
        1.12345678
      ),
      new Candle(
        1616175004063,
        1234.56789,
        1234.56789,
        1234.56789,
        1234.56789,
        1.12345678
      )
    ]);

    const result = await feed.query(instrument, {
      from: 1616175004062,
      to: 1616175004064,
      count: 100
    });

    expect(result.length).toBe(1);
  });

  test('should patch a store with events', done => {
    const feed = new Feed(new SQLiteStorage(dbName));
    const store = new Store();

    store.snapshot.universe.instrument.upsert(instrument);
    store.snapshot.subscription.instrument.upsert(instrument);

    const streamer = new BacktesterStreamer(
      store,
      feed,
      {
        from: 0,
        to: 10
      },
      {
        onBacktestCompleted: () => {
          const trade = store.snapshot.trade.get(instrument.id);

          expect(trade.timestamp).toEqual(8);
          expect(trade.rate).toEqual(8);
          expect(trade.quantity).toEqual(8);
          expect(store.snapshot.timestamp).toEqual(8);

          done();
        }
      }
    );

    feed
      .save(instrument, [
        new Candle(1, 1, 1, 1, 1, 1),
        new Candle(2, 2, 2, 2, 2, 2),
        new Candle(3, 3, 3, 3, 3, 3),
        new Candle(4, 4, 4, 4, 4, 4),
        new Candle(5, 5, 5, 5, 5, 5),
        new Candle(6, 6, 6, 6, 6, 6),
        new Candle(7, 7, 7, 7, 7, 7),
        new Candle(8, 8, 8, 8, 8, 8)
      ])
      .then(() => {
        streamer.subscribe(instrument);
        streamer.tryContinue();
      });
  });
});
