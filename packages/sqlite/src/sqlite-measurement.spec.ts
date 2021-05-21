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

  test('should read and write measurement', async () => {
    const measurement = new SQLiteMeasurement({
      filename: dbName
    });

    const session = 'test-session';

    await measurement.write(
      session,
      [...Array(10).keys()].map(it => ({
        timestamp: it + 1,
        type: 'spread',
        value: it + 1
      }))
    );

    const after = await measurement.read(session, 5, 'FORWARD');

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

    const before = await measurement.read(session, 6, 'BACKWARD');

    expect(before.length).toBe(5);
    expect(before[0].timestamp).toBe(3);
    expect(before[0].type).toBe('spread');
    expect(before[0].value).toBe(3);

    expect(before[1].timestamp).toBe(4);
    expect(before[1].type).toBe('spread');
    expect(before[1].value).toBe(4);

    expect(before[2].timestamp).toBe(5);
    expect(before[2].type).toBe('spread');
    expect(before[2].value).toBe(5);
  });
});
