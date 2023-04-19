import { makeTestModule } from '@lib/make-test-module';
import { useMemo } from '@lib/use-memo';

import { dependency } from './use-hash';

describe(useMemo.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('memorize value for dependencies', async () => {
    const value1 = await fixtures.givenMemoValue(() => 1, [useMemo.name]);
    const value2 = await fixtures.givenMemoValue(() => 2, [useMemo.name]);

    expect(value1).toEqual(1);
    expect(value2).toEqual(1);
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  return {
    givenMemoValue<T>(value: () => T, dependencies: dependency[]) {
      return act(() => useMemo(value, dependencies));
    }
  };
}
