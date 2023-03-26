import { d } from '@lib/shared';
import { eq, gt, lt, storageObject } from '@lib/storage';

import { InMemoryStorage } from './in-memory-storage';

describe(InMemoryStorage.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('read empty storage', async () => {
    const { sut } = fixtures;

    const pricing = storageObject('pricing', {
      timestamp: 'number',
      rate: 'decimal'
    });

    const set = await sut.query(pricing, {});

    expect(set).toEqual([]);
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
  const sut = new InMemoryStorage();

  return {
    sut
  };
}
