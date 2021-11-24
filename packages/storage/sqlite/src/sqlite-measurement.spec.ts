import { existsSync, unlinkSync } from 'fs';
import { SQLiteMeasurement } from './sqlite-storage';

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

  test('should return empty array for unknown session', async () => {
    const measurement = SQLiteMeasurement(dbName);

    const measure = await measurement.query(0, {
      from: 0,
      count: 100
    });

    expect(measure).toEqual([]);
  });

  test('should list written sessions', async () => {
    const measurement = SQLiteMeasurement(dbName);

    await measurement.save(
      1,
      [...Array(10).keys()].map(it => ({
        timestamp: it + 1,
        kind: 'spread',
        payload: { value: it + 1 }
      }))
    );

    await measurement.save(
      2,
      [...Array(10).keys()].map(it => ({
        timestamp: it + 1,
        kind: 'spread',
        payload: { value: it + 1 }
      }))
    );

    const index = await measurement.index();

    expect(index.length).toBe(2);
    expect(index[0]).toBe(1);
    expect(index[1]).toBe(2);
  });

  test('should read and write measurement', async () => {
    const measurement = SQLiteMeasurement(dbName);

    const session = 1;

    await measurement.save(
      session,
      [...Array(10).keys()].map(it => ({
        timestamp: it + 1,
        kind: 'spread',
        payload: { value: it + 1 }
      }))
    );

    const index = await measurement.index();

    const after = await measurement.query(session, {
      from: 5,
      count: 100
    });

    expect(after.length).toBe(5);
    expect(after[0].timestamp).toBe(6);
    expect(after[0].kind).toBe('spread');
    expect(after[0].payload.value).toBe(6);

    expect(after[1].timestamp).toBe(7);
    expect(after[1].kind).toBe('spread');
    expect(after[1].payload.value).toBe(7);

    expect(after[2].timestamp).toBe(8);
    expect(after[2].kind).toBe('spread');
    expect(after[2].payload.value).toBe(8);

    const before = await measurement.query(session, {
      to: 6,
      count: 100
    });

    expect(before.length).toBe(5);
    expect(before[0].timestamp).toBe(1);
    expect(before[0].kind).toBe('spread');
    expect(before[0].payload.value).toBe(1);

    expect(before[1].timestamp).toBe(2);
    expect(before[1].kind).toBe('spread');
    expect(before[1].payload.value).toBe(2);

    expect(before[2].timestamp).toBe(3);
    expect(before[2].kind).toBe('spread');
    expect(before[2].payload.value).toBe(3);
  });

  test('should read and write specific measurement (state)', async () => {
    const measurement = SQLiteMeasurement(dbName);

    const session = 1;

    await measurement.save(session, [
      {
        timestamp: 1,
        kind: 'order-completed',
        payload: { rate: 100 }
      },
      {
        timestamp: 5,
        kind: 'order-completed',
        payload: { rate: 105 }
      }
    ]);

    let measure = await measurement.query(session, {
      to: 2,
      count: 1,
      kind: 'order-completed'
    });

    expect(measure.length).toBe(1);
    expect(measure[0].timestamp).toBe(1);
    expect(measure[0].kind).toBe('order-completed');
    expect(measure[0].payload.rate).toBe(100);

    measure = await measurement.query(session, {
      to: 6,
      count: 1
    });

    expect(measure.length).toBe(1);
    expect(measure[0].timestamp).toBe(5);
    expect(measure[0].kind).toBe('order-completed');
    expect(measure[0].payload.rate).toBe(105);
  });
});
