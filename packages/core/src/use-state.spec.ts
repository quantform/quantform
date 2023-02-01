import { makeTestModule } from '@lib/make-test-module';
import { useState } from '@lib/use-state';

describe(useState.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('keep same state between multiple requests for the same dependency', async () => {
    const state1 = await fixtures.givenState({ text: 'Hello my state' }, ['my-state']);
    const state2 = await fixtures.givenState({ text: 'Hello my override state' }, [
      'my-state'
    ]);

    expect(Object.is(state1, state2)).toBeTruthy();
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  return {
    givenState<T>(value: T, dependencies: unknown[]) {
      return act(() => useState(value, dependencies));
    }
  };
}
