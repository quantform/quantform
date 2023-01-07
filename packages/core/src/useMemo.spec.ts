import { useMemo } from '@lib/useMemo';

describe(useMemo.name, () => {
  let fixtures: ReturnType<typeof getFixtures>;

  beforeEach(() => {
    fixtures = getFixtures();
  });

  test('memorize value for dependencies', () => {
    const value1 = fixtures.givenMemoValue(() => 1, [useMemo.name]);
    const value2 = fixtures.givenMemoValue(() => 2, [useMemo.name]);

    expect(value1).toEqual(1);
    expect(value2).toEqual(1);
  });
});

function getFixtures() {
  return {
    givenMemoValue<T>(value: () => T, dependencies: unknown[]) {
      return useMemo(value, dependencies);
    }
  };
}
