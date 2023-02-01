import { makeTestModule } from '@lib/make-test-module';
import { useCache } from '@lib/storage/use-cache';
import { useMemo } from '@lib/use-memo';

describe(useMemo.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('cache value for dependencies', async () => {
    const value1 = await fixtures.givenCacheValue(() => 1, ['val']);
    const value2 = await fixtures.givenCacheValue(() => 2, ['val']);

    expect(value1).toEqual(1);
    expect(value2).toEqual(1);
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  return {
    givenCacheValue<T>(value: () => T, dependencies: unknown[]) {
      return act(() => useCache(value, dependencies));
    }
  };
}
