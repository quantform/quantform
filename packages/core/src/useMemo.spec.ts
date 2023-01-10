import { makeTestModule } from '@lib/make-test-module';
import { useMemo } from '@lib/useMemo';

describe(useMemo.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('memorize value for dependencies', () => {
    const value1 = fixtures.givenMemoValue(() => 1, [useMemo.name]);
    const value2 = fixtures.givenMemoValue(() => 2, [useMemo.name]);

    expect(value1).toEqual(1);
    expect(value2).toEqual(1);
  });
});

async function getFixtures() {
  const module = await makeTestModule({ dependencies: [] });

  return {
    givenMemoValue<T>(value: () => T, dependencies: unknown[]) {
      return module.executeUsingModule(() => useMemo(value, dependencies));
    }
  };
}
