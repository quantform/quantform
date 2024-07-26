import { of } from 'rxjs';

import { Dependency } from './module';
import { after, before, behavior, strategy } from './strategy';

describe(strategy.name, () => {
  let fixtures: ReturnType<typeof getFixtures>;

  beforeEach(() => {
    fixtures = getFixtures();
  });

  test('happy path', () => {
    const sut = strategy(() => {
      before(() => of('before'));
      behavior(() => of('behavior 1'));
      behavior(() => of('behavior 2'));
      after(() => of('after'));

      return fixtures.given.dependencies();
    });

    expect(sut.dependencies).toEqual(
      expect.arrayContaining(fixtures.given.dependencies())
    );
    expect(sut.description).toEqual({
      before: [expect.any(Function)],
      behavior: [expect.any(Function), expect.any(Function)],
      after: [expect.any(Function)]
    });
  });
});

function getFixtures() {
  return {
    given: {
      dependencies(): Dependency[] {
        return [];
      }
    }
  };
}
