import { existsSync, unlinkSync } from 'fs';

import { d, makeTestModule, storageObject } from '@quantform/core';

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
    const { sut, storageObject } = fixtures;

    console.log(
      JSON.stringify({ timestamp: 1, price: d('1.123456789123456789'), quantity: 5 })
    );

    await sut.save(storageObject, [
      { timestamp: 1, price: d('1.123456789123456789'), quantity: 5 }
    ]);

    const set = await sut.query(storageObject, {});

    expect(set).toEqual([
      { timestamp: 1, price: d('1.123456789123456789'), quantity: 5 }
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
    storageObject: storageObject('test', {
      timestamp: 'number',
      price: 'decimal',
      quantity: 'number'
    }),
    dispose() {
      if (existsSync(sut.filename)) {
        unlinkSync(sut.filename);
      }
    }
  };
}
