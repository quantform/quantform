import { d } from '@lib/shared';
import { eq, gt, lt, Storage } from '@lib/storage';
import { ns } from '@lib/use-timestamp';

import { InMemoryStorage } from './in-memory-storage';

describe(InMemoryStorage.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('read empty storage', async () => {
    const { sut } = fixtures;

    const pricing = Storage.createObject('pricing', {
      timestamp: 'number',
      rate: 'decimal'
    });

    const set = await sut.query(pricing, {});

    expect(set).toEqual([]);
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
  const sut = new InMemoryStorage();

  return {
    sut
  };
}
