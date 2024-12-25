import { makeTestModule } from '@lib/make-test-module';
import { useExecutionMode } from '@lib/use-execution-mode';

import { useSimulator } from './use-simulator';

describe(useSimulator.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('get real value when simulator mode disabled', async () => {
    const { act } = await fixtures.givenModule(false);

    const value = act(() => useSimulator('simulator', 'real'));

    expect(value).toBe('real');
  });

  test('get simulation value when simulator mode enabled', async () => {
    const { act } = await fixtures.givenModule(true);

    const value = act(() => useSimulator('simulator', 'real'));

    expect(value).toBe('simulator');
  });
});

async function getFixtures() {
  return {
    async givenModule(isSimulation: boolean) {
      return isSimulation
        ? await makeTestModule([useExecutionMode.paperOptions({ recording: false })])
        : await makeTestModule([useExecutionMode.liveOptions({ recording: false })]);
    }
  };
}
