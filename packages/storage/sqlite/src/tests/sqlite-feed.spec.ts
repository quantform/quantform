import { Asset, Instrument, TradePatchEvent } from '@quantform/core';
import { unlinkSync, existsSync } from 'fs';
import { SQLiteFeed } from '../sqlite-feed';

describe('sqlite feed integration tests', () => {
  const dbName = 'test.db';
  const instrument = new Instrument(
    new Asset('btc', 'binance', 8),
    new Asset('usdt', 'binance', 2),
    ''
  );

  beforeEach(() => {
    if (existsSync(dbName)) {
      unlinkSync(dbName);
    }
  });

  test('should create db file in user directory', async () => {
    const feed = new SQLiteFeed();

    const input = [
      new TradePatchEvent(instrument, 1234.56789, 1.12345678, 1616175004063)
    ];

    await feed.write(instrument, input);

    const output = await feed.read(instrument, 1616175004062, 1616234152109);

    expect(output.length).toBe(1);
  });

  test('should insert multiple rows', async () => {
    const feed = new SQLiteFeed({
      filename: dbName
    });

    const input = [
      new TradePatchEvent(instrument, 1234.56789, 1.12345678, 1616175004063),
      new TradePatchEvent(instrument, 1234.56789, 2.12345678, 1616221874143),
      new TradePatchEvent(instrument, 1234.56789, 3.12345678, 1616234152108)
    ];

    await feed.write(instrument, input);

    const output = await feed.read(instrument, 1616175004062, 1616234152109);

    expect(output.length).toBe(3);
    expect(output[0].timestamp).toBe(input[0].timestamp);
    expect(output[1].timestamp).toBe(input[1].timestamp);
    expect(output[2].timestamp).toBe(input[2].timestamp);
  });

  test('should limit result', async () => {
    const feed = new SQLiteFeed({
      filename: dbName,
      limit: 2
    });

    const input = [
      new TradePatchEvent(instrument, 1234.56789, 1.12345678, 1616175004063),
      new TradePatchEvent(instrument, 1234.56789, 2.12345678, 1616221874143),
      new TradePatchEvent(instrument, 1234.56789, 3.12345678, 1616234152108)
    ];

    await feed.write(instrument, input);

    const output = await feed.read(instrument, 1616175004062, 1616234152109);

    expect(output.length).toBe(2);
    expect(output[0].timestamp).toBe(input[0].timestamp);
    expect(output[1].timestamp).toBe(input[1].timestamp);
  });

  test('should override duplicated rows', async () => {
    const feed = new SQLiteFeed({
      filename: dbName
    });

    await feed.write(instrument, [
      new TradePatchEvent(instrument, 1234.56789, 1.12345678, 1616175004063),
      new TradePatchEvent(instrument, 1234.56789, 1.12345678, 1616175004063),
      new TradePatchEvent(instrument, 1234.56789, 1.12345678, 1616175004063)
    ]);

    const result = await feed.read(instrument, 1616175004062, 1616175004064);

    expect(result.length).toBe(1);
  });
});
