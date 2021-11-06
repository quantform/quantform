import { existsSync, unlinkSync } from 'fs';
import { SQLiteMeasurement } from './sqlite-measurement';

describe('sqlite measurement tests', () => {
  const dbName = 'measurement.db';

  beforeEach(() => {
    if (existsSync(dbName)) {
      unlinkSync(dbName);
    }
  });

  afterAll(() => {
    if (existsSync(dbName)) {
      unlinkSync(dbName);
    }
  });

  test('should return proper filename', () => {
    const feed = new SQLiteMeasurement({
      filename: dbName
    });

    expect(feed.getDatabaseFilename()).toBe(dbName);
  });

  test('should list written sessions', async () => {
    const measurement = new SQLiteMeasurement({
      filename: dbName
    });

    await measurement.save(
      1,
      [...Array(10).keys()].map(it => ({
        timestamp: it + 1,
        type: 'spread',
        value: it + 1
      }))
    );

    await measurement.save(
      2,
      [...Array(10).keys()].map(it => ({
        timestamp: it + 1,
        type: 'spread',
        value: it + 1
      }))
    );

    const index = await measurement.index();

    expect(index.length).toBe(2);
    expect(index[0]).toBe(1);
    expect(index[1]).toBe(2);
  });

  test('should read and write measurement', async () => {
    const measurement = new SQLiteMeasurement({
      filename: dbName
    });

    const session = 1;

    await measurement.save(
      session,
      [...Array(10).keys()].map(it => ({
        timestamp: it + 1,
        type: 'spread',
        value: it + 1
      }))
    );

    const index = await measurement.index();

    const after = await measurement.query(session, {
      timestamp: 5,
      direction: 'FORWARD',
      limit: 100
    });

    expect(after.length).toBe(5);
    expect(after[0].timestamp).toBe(6);
    expect(after[0].type).toBe('spread');
    expect(after[0].value).toBe(6);

    expect(after[1].timestamp).toBe(7);
    expect(after[1].type).toBe('spread');
    expect(after[1].value).toBe(7);

    expect(after[2].timestamp).toBe(8);
    expect(after[2].type).toBe('spread');
    expect(after[2].value).toBe(8);

    const before = await measurement.query(session, {
      timestamp: 6,
      direction: 'BACKWARD',
      limit: 100
    });

    expect(before.length).toBe(5);
    expect(before[0].timestamp).toBe(1);
    expect(before[0].type).toBe('spread');
    expect(before[0].value).toBe(1);

    expect(before[1].timestamp).toBe(2);
    expect(before[1].type).toBe('spread');
    expect(before[1].value).toBe(2);

    expect(before[2].timestamp).toBe(3);
    expect(before[2].type).toBe('spread');
    expect(before[2].value).toBe(3);
  });

  test('should read and write specific measurement (state)', async () => {
    const measurement = new SQLiteMeasurement({
      filename: dbName
    });

    const session = 1;

    await measurement.save(session, [
      {
        timestamp: 1,
        type: 'order-completed',
        rate: 100
      },
      {
        timestamp: 5,
        type: 'order-completed',
        rate: 105
      }
    ]);

    let measure = await measurement.query(session, {
      timestamp: 2,
      direction: 'BACKWARD',
      limit: 1,
      type: 'order-completed'
    });

    expect(measure.length).toBe(1);
    expect(measure[0].timestamp).toBe(1);
    expect(measure[0].type).toBe('order-completed');
    expect(measure[0].rate).toBe(100);

    measure = await measurement.query(session, {
      timestamp: 6,
      direction: 'BACKWARD',
      limit: 1
    });

    expect(measure.length).toBe(1);
    expect(measure[0].timestamp).toBe(5);
    expect(measure[0].type).toBe('order-completed');
    expect(measure[0].rate).toBe(105);
  });
});
