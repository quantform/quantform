import { firstValueFrom, Observable, of } from 'rxjs';

import { makeTestModule } from '@lib/make-test-module';
import { useCache } from '@lib/storage/use-cache';
import { dependency } from '@lib/use-hash';

describe(useCache.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('cache value for dependencies', async () => {
    const value1 = await firstValueFrom(fixtures.givenCacheValue(of(1), ['val']));
    const value2 = await firstValueFrom(fixtures.givenCacheValue(of(2), ['val']));

    expect(value1).toEqual(1);
    expect(value2).toEqual(1);
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  return {
    givenCacheValue<T>(value: Observable<T>, dependencies: dependency[]) {
      return act(() => useCache(value, dependencies));
    }
  };
}
