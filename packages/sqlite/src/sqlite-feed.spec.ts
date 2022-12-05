import { existsSync, unlinkSync } from 'fs';

import {
  Asset,
  BacktesterStreamer,
  Commission,
  d,
  Feed,
  Instrument,
  Store,
  TradePatchEvent
} from '@quantform/core';

import { SQLiteStorage } from '@lib/sqlite-storage';

describe(SQLiteStorage.name, () => {
  const dbName = 'test.db';
  const instrument = new Instrument(
    0,
    new Asset('btc', 'binance', 8),
    new Asset('usdt', 'binance', 2),
    '',
    Commission.Zero
  );

  afterEach(() => {
    if (existsSync(dbName)) {
      unlinkSync(dbName);
    }
  });

  test('should create db file in user directory', async () => {
    const feed = new Feed(new SQLiteStorage(dbName));

    const input = [
      new TradePatchEvent(instrument, d(1234.56789), d(1.12345678), 1616175004063)
    ];

    await feed.save(input);

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
      new TradePatchEvent(instrument, d(1234.56789), d(1.12345678), 1616175004063),
      new TradePatchEvent(instrument, d(1234.56789), d(2.12345678), 1616221874143),
      new TradePatchEvent(instrument, d(1234.56789), d(3.12345678), 1616234152108)
    ];

    await feed.save(input);

    const output = await feed.query(instrument, {
      from: 1616175004062,
      to: 1616234152109,
      count: 100
    });

    expect(output.length).toBe(3);

    for (let i = 0; i < 3; i++) {
      expect(output[i]).toEqual(input[i]);
    }
  });

  test('should limit result', async () => {
    const feed = new Feed(new SQLiteStorage(dbName));

    const input = [
      new TradePatchEvent(instrument, d(1234.56789), d(1.12345678), 1616175004063),
      new TradePatchEvent(instrument, d(1234.56789), d(2.12345678), 1616221874143),
      new TradePatchEvent(instrument, d(1234.56789), d(3.12345678), 1616234152108)
    ];

    await feed.save(input);

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

    await feed.save([
      new TradePatchEvent(instrument, d(1234.56789), d(1.12345678), 1616175004063),
      new TradePatchEvent(instrument, d(1234.56789), d(2.12345678), 1616221874143),
      new TradePatchEvent(instrument, d(1234.56789), d(3.12345678), 1616234152108)
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
          const trade = store.snapshot.trade.get(instrument.id) ?? fail();

          expect(trade.timestamp).toEqual(8);
          expect(trade.rate).toEqual(d(8));
          expect(trade.quantity).toEqual(d(8));
          expect(store.snapshot.timestamp).toEqual(8);

          done();
        }
      }
    );

    feed
      .save([
        new TradePatchEvent(instrument, d(1), d(1), 1),
        new TradePatchEvent(instrument, d(2), d(2), 2),
        new TradePatchEvent(instrument, d(3), d(3), 3),
        new TradePatchEvent(instrument, d(4), d(4), 4),
        new TradePatchEvent(instrument, d(5), d(5), 5),
        new TradePatchEvent(instrument, d(6), d(6), 6),
        new TradePatchEvent(instrument, d(7), d(7), 7),
        new TradePatchEvent(instrument, d(8), d(8), 8)
      ])
      .then(() => {
        streamer.subscribe(instrument);
        streamer.tryContinue();
      });
  });
});
