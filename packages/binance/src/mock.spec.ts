import { makeTestModule, mockedFunc, useTimestamp } from '@quantform/core';

const mock = {
  ...jest.requireActual('@quantform/core'),
  useTimestamp: () => jest.fn()
};

jest.mock('@quantform/core', () => mock);

describe('mock', () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('mock returned value', async () => {
    const { act } = fixtures;
    const o = 5n;

    const timestamp = await act(() => useTimestamp());

    expect(timestamp).toEqual(2);
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  const { useTimestamp } = await import('@quantform/core');

  mockedFunc(useTimestamp).mockReturnValueOnce(2);

  return { act };
}
