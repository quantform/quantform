import { instrumentOf } from '@quantform/core';
import { InfluxFeed } from '../influx.feed';
import * as moment from 'moment';

describe('influx storage integration tests', () => {
  test('shoud query', async () => {
    const storage = new InfluxFeed();

    await storage.initialize();

    const query = await storage.read(
      instrumentOf('binance:reef-usdt'),
      moment('2021-01-01', 'YYYY-MM-DD HH:mm:ss')
        .utc()
        .toDate()
        .getTime(),
      moment('2022-01-01', 'YYYY-MM-DD HH:mm:ss')
        .utc()
        .toDate()
        .getTime()
    );

    expect(query.length).toBeGreaterThan(0);
  });
});
