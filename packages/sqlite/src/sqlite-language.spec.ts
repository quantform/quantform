import { d, eq, lt, storageObject } from '@quantform/core';

import { SQLiteLanguage } from './sqlite-language';

describe(SQLiteLanguage.name, () => {
  test('create table for object', async () => {
    const object = storageObject('orders', {
      timestamp: 'number',
      price: 'decimal',
      id: 'string'
    });

    const sql = SQLiteLanguage.createTable(object);

    expect(sql).toEqual(
      `CREATE TABLE IF NOT EXISTS "orders" (timestamp INTEGER NOT NULL, price TEXT NOT NULL, id TEXT NOT NULL, PRIMARY KEY (timestamp))`
    );
  });

  test('select to query object', async () => {
    const object = storageObject('orders', {
      timestamp: 'number',
      price: 'decimal',
      id: 'string'
    });

    const sql = SQLiteLanguage.query(object, {
      where: {
        timestamp: lt(100),
        id: eq('unique-id'),
        price: eq(d('1.123456789123456789'))
      }
    });

    expect(sql).toEqual(
      `SELECT timestamp, price, id FROM "orders" WHERE timestamp < 100 AND id = 'unique-id' AND price = '1.123456789123456789'`
    );
  });

  test('replace statement', async () => {
    const object = storageObject('orders', {
      timestamp: 'number',
      price: 'decimal',
      id: 'string'
    });

    const sql = SQLiteLanguage.replace(object);

    expect(sql).toEqual(`REPLACE INTO "orders" (timestamp, price, id) VALUES(?, ?, ?)`);
  });
});
