import { existsSync, unlinkSync } from 'fs';

import { d, eq, gt, lt, makeTestModule, storageObject } from '@quantform/core';

import { SQLiteStorage } from './sqlite-storage';

describe(SQLiteStorage.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  afterEach(() => {
    fixtures.dispose();
  });
  /*
  test('index return the names of discriminators', async () => {
    const { sut } = fixtures;

    await sut.save({ discriminator: 'pricing' }, [{ timestamp: 1, message: 'test-1' }]);
    await sut.save({ discriminator: 'ordering' }, [{ timestamp: 1, message: 'test-1' }]);

    const index = await sut.index();

    expect(index).toEqual(['pricing', 'ordering']);
  });
*/
  test('write and read single object', async () => {
    const { sut, object } = fixtures;

    await sut.save(object, [
      { timestamp: 1, id: '123 123', price: d('1.123456789123456789'), quantity: 5 }
    ]);

    const set = await sut.query(object, {
      where: {
        id: eq('123 123')
      }
    });

    expect(set).toEqual([
      { timestamp: 1, id: '123 123', price: d('1.123456789123456789'), quantity: 5 }
    ]);
  });

  test('save and read full data', async () => {
    const { sut } = fixtures;

    const pricing = storageObject('pricing', {
      timestamp: 'number',
      rate: 'decimal'
    });

    await sut.save(pricing, [
      { timestamp: 1, rate: d(1) },
      { timestamp: 2, rate: d(2) },
      { timestamp: 3, rate: d(3) },
      { timestamp: 4, rate: d(4) },
      { timestamp: 5, rate: d(5) }
    ]);

    const set = await sut.query(pricing, {});

    expect(set).toEqual([
      { timestamp: 1, rate: d(1) },
      { timestamp: 2, rate: d(2) },
      { timestamp: 3, rate: d(3) },
      { timestamp: 4, rate: d(4) },
      { timestamp: 5, rate: d(5) }
    ]);
  });

  test('save and read limited data', async () => {
    const { sut } = fixtures;

    const pricing = storageObject('pricing', {
      timestamp: 'number',
      rate: 'decimal'
    });

    await sut.save(pricing, [
      { timestamp: 1, rate: d(1) },
      { timestamp: 2, rate: d(2) },
      { timestamp: 3, rate: d(3) },
      { timestamp: 4, rate: d(4) },
      { timestamp: 5, rate: d(5) }
    ]);

    const set = await sut.query(pricing, { limit: 3 });

    expect(set).toEqual([
      { timestamp: 1, rate: d(1) },
      { timestamp: 2, rate: d(2) },
      { timestamp: 3, rate: d(3) }
    ]);
  });

  test('save and read desc ordered data', async () => {
    const { sut } = fixtures;

    const pricing = storageObject('pricing', {
      timestamp: 'number',
      rate: 'decimal'
    });

    await sut.save(pricing, [
      { timestamp: 1, rate: d(1) },
      { timestamp: 2, rate: d(2) },
      { timestamp: 3, rate: d(3) },
      { timestamp: 4, rate: d(4) },
      { timestamp: 5, rate: d(5) }
    ]);

    const set = await sut.query(pricing, { orderBy: 'DESC' });

    expect(set).toEqual([
      { timestamp: 5, rate: d(5) },
      { timestamp: 4, rate: d(4) },
      { timestamp: 3, rate: d(3) },
      { timestamp: 2, rate: d(2) },
      { timestamp: 1, rate: d(1) }
    ]);
  });

  test('save and read filtered eq data', async () => {
    const { sut } = fixtures;

    const pricing = storageObject('pricing', {
      timestamp: 'number',
      rate: 'decimal'
    });

    await sut.save(pricing, [
      { timestamp: 1, rate: d(1) },
      { timestamp: 2, rate: d(2) },
      { timestamp: 3, rate: d(3) },
      { timestamp: 4, rate: d(4) },
      { timestamp: 5, rate: d(5) }
    ]);

    const set = await sut.query(pricing, {
      where: {
        timestamp: eq(4)
      }
    });

    expect(set).toEqual([{ timestamp: 4, rate: d(4) }]);
  });

  test('save and read filtered lt data', async () => {
    const { sut } = fixtures;

    const pricing = storageObject('pricing', {
      timestamp: 'number',
      rate: 'decimal'
    });

    await sut.save(pricing, [
      { timestamp: 1, rate: d(1) },
      { timestamp: 2, rate: d(2) },
      { timestamp: 3, rate: d(3) },
      { timestamp: 4, rate: d(4) },
      { timestamp: 5, rate: d(5) }
    ]);

    const set = await sut.query(pricing, {
      where: {
        timestamp: lt(3)
      }
    });

    expect(set).toEqual([
      { timestamp: 1, rate: d(1) },
      { timestamp: 2, rate: d(2) }
    ]);
  });

  test('save and read filtered gt data', async () => {
    const { sut } = fixtures;

    const pricing = storageObject('pricing', {
      timestamp: 'number',
      rate: 'decimal'
    });

    await sut.save(pricing, [
      { timestamp: 1, rate: d(1) },
      { timestamp: 2, rate: d(2) },
      { timestamp: 3, rate: d(3) },
      { timestamp: 4, rate: d(4) },
      { timestamp: 5, rate: d(5) }
    ]);

    const set = await sut.query(pricing, {
      where: {
        timestamp: gt(3)
      }
    });

    expect(set).toEqual([
      { timestamp: 4, rate: d(4) },
      { timestamp: 5, rate: d(5) }
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
    object: storageObject('test', {
      timestamp: 'number',
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
