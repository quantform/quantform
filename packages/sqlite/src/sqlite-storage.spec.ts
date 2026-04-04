import { existsSync, unlinkSync } from 'fs';

import { d, eq, gt, lt, makeTestModule, ns, Storage } from '@quantform/core';

import { SQLiteStorage } from './sqlite-storage';

describe(SQLiteStorage.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  afterEach(() => {
    fixtures.dispose();
  });

  test('write and read single object', async () => {
    const { sut, object } = fixtures;

    await sut.save(object, [
      {
        timestamp: ns(1),
        id: '123 123',
        price: d('1.123456789123456789'),
        quantity: 5
      }
    ]);

    const set = await sut.query(object, {
      where: {
        id: eq('123 123')
      }
    });

    expect(set).toEqual([
      {
        timestamp: ns(1),
        id: '123 123',
        price: d('1.123456789123456789'),
        quantity: 5
      }
    ]);
  });

  test('save and read full data', async () => {
    const { sut } = fixtures;

    const pricing = Storage.createObject('pricing', {
      timestamp: 'bigint',
      rate: 'decimal'
    });

    await sut.save(pricing, [
      { timestamp: ns(1), rate: d(1) },
      { timestamp: ns(2), rate: d(2) },
      { timestamp: ns(3), rate: d(3) },
      { timestamp: ns(4), rate: d(4) },
      { timestamp: ns(5), rate: d(5) }
    ]);

    const set = await sut.query(pricing, {});

    expect(set).toEqual([
      { timestamp: ns(1), rate: d(1) },
      { timestamp: ns(2), rate: d(2) },
      { timestamp: ns(3), rate: d(3) },
      { timestamp: ns(4), rate: d(4) },
      { timestamp: ns(5), rate: d(5) }
    ]);
  });

  test('save and read limited data', async () => {
    const { sut } = fixtures;

    const pricing = Storage.createObject('pricing', {
      timestamp: 'bigint',
      rate: 'decimal'
    });

    await sut.save(pricing, [
      { timestamp: ns(1), rate: d(1) },
      { timestamp: ns(2), rate: d(2) },
      { timestamp: ns(3), rate: d(3) },
      { timestamp: ns(4), rate: d(4) },
      { timestamp: ns(5), rate: d(5) }
    ]);

    const set = await sut.query(pricing, { limit: 3 });

    expect(set).toEqual([
      { timestamp: ns(1), rate: d(1) },
      { timestamp: ns(2), rate: d(2) },
      { timestamp: ns(3), rate: d(3) }
    ]);
  });

  test('save and read desc ordered data', async () => {
    const { sut } = fixtures;

    const pricing = Storage.createObject('pricing', {
      timestamp: 'bigint',
      rate: 'decimal'
    });

    await sut.save(pricing, [
      { timestamp: ns(1), rate: d(1) },
      { timestamp: ns(2), rate: d(2) },
      { timestamp: ns(3), rate: d(3) },
      { timestamp: ns(4), rate: d(4) },
      { timestamp: ns(5), rate: d(5) }
    ]);

    const set = await sut.query(pricing, { orderBy: 'DESC' });

    expect(set).toEqual([
      { timestamp: ns(5), rate: d(5) },
      { timestamp: ns(4), rate: d(4) },
      { timestamp: ns(3), rate: d(3) },
      { timestamp: ns(2), rate: d(2) },
      { timestamp: ns(1), rate: d(1) }
    ]);
  });

  test('save and read filtered eq data', async () => {
    const { sut } = fixtures;

    const pricing = Storage.createObject('pricing', {
      timestamp: 'bigint',
      rate: 'decimal'
    });

    await sut.save(pricing, [
      { timestamp: ns(1), rate: d(1) },
      { timestamp: ns(2), rate: d(2) },
      { timestamp: ns(3), rate: d(3) },
      { timestamp: ns(4), rate: d(4) },
      { timestamp: ns(5), rate: d(5) }
    ]);

    const set = await sut.query(pricing, {
      where: {
        timestamp: eq(4)
      }
    });

    expect(set).toEqual([{ timestamp: ns(4), rate: d(4) }]);
  });

  test('save and read filtered lt data', async () => {
    const { sut } = fixtures;

    const pricing = Storage.createObject('pricing', {
      timestamp: 'bigint',
      rate: 'decimal'
    });

    await sut.save(pricing, [
      { timestamp: ns(1), rate: d(1) },
      { timestamp: ns(2), rate: d(2) },
      { timestamp: ns(3), rate: d(3) },
      { timestamp: ns(4), rate: d(4) },
      { timestamp: ns(5), rate: d(5) }
    ]);

    const set = await sut.query(pricing, {
      where: {
        timestamp: lt(3)
      }
    });

    expect(set).toEqual([
      { timestamp: ns(1), rate: d(1) },
      { timestamp: ns(2), rate: d(2) }
    ]);
  });

  test('save and read filtered gt data', async () => {
    const { sut } = fixtures;

    const pricing = Storage.createObject('pricing', {
      timestamp: 'bigint',
      rate: 'decimal'
    });

    await sut.save(pricing, [
      { timestamp: ns(1), rate: d(1) },
      { timestamp: ns(2), rate: d(2) },
      { timestamp: ns(3), rate: d(3) },
      { timestamp: ns(4), rate: d(4) },
      { timestamp: ns(5), rate: d(5) }
    ]);

    const set = await sut.query(pricing, {
      where: {
        timestamp: gt(3)
      }
    });

    expect(set).toEqual([
      { timestamp: ns(4), rate: d(4) },
      { timestamp: ns(5), rate: d(5) }
    ]);
  });
});

async function getFixtures() {
  const { get } = await makeTestModule([
    {
      provide: 'storage',
      useValue: new SQLiteStorage('test.db')
    }
  ]);

  const sut = get<SQLiteStorage>('storage');

  return {
    sut,
    object: Storage.createObject('test', {
      timestamp: 'bigint',
      price: 'decimal',
      quantity: 'number',
      id: 'string'
    }),
    dispose() {
      if (existsSync(sut.filename)) {
        unlinkSync(sut.filename);
      }
    }
  };
}
