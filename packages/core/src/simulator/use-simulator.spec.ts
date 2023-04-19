import { makeTestModule, mockedFunc } from '@lib/make-test-module';
import { useExecutionMode } from '@lib/use-execution-mode';

import { useSimulator } from './use-simulator';

jest.mock('@lib/use-execution-mode', () => ({
  ...jest.requireActual('@lib/use-execution-mode'),
  useExecutionMode: jest.fn()
}));

describe(useSimulator.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  afterEach(() => fixtures.clear());

  test('get real value when simulator mode disabled', () => {
    const { act } = fixtures;

    fixtures.givenSimulationEnabled(false);

    const value = act(() => useSimulator('simulator', 'real'));

    expect(value).toBe('real');
  });

  test('get simulation value when simulator mode enabled', () => {
    const { act } = fixtures;

    fixtures.givenSimulationEnabled(true);

    const value = act(() => useSimulator('simulator', 'real'));

    expect(value).toBe('simulator');
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  return {
    act,
    givenSimulationEnabled(isSimulation: boolean) {
      mockedFunc(useExecutionMode).mockReturnValue({
        isSimulation,
        recording: false
      } as any);
    },
    clear: jest.clearAllMocks
  };
}
