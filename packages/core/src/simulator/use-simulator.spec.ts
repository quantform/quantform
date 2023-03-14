import { makeTestModule, mockedFunc } from '@lib/make-test-module';
import { IExecutionMode, useExecutionMode } from '@lib/use-execution-mode';

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

  it.each<[string, IExecutionMode['mode']]>([
    ['real', 'LIVE'],
    ['simulator', 'PAPER'],
    ['simulator', 'REPLAY']
  ])('get %p value for %p mode ', (value, mode) => {
    const { act } = fixtures;

    fixtures.givenExecutionMode(mode);

    const it = act(() => useSimulator('simulator', 'real'));

    expect(it).toBe(value);
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  return {
    act,
    givenExecutionMode(mode: IExecutionMode['mode']) {
      mockedFunc(useExecutionMode).mockReturnValue({
        mode,
        recording: false
      });
    },
    clear: jest.clearAllMocks
  };
}
