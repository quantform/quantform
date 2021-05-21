import { SQLiteFeed } from './sqlite-feed';

describe('sqlite feed tests', () => {
  const dbName = 'test.db';

  test('should return proper filename', async () => {
    const feed = new SQLiteFeed({
      filename: dbName
    });

    expect(feed.getDatabaseFilename()).toBe(dbName);
  });
});
