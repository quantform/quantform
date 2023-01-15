import { makeTestModule } from '@lib/make-test-module';
import { useSampler } from '@lib/useSampler';

describe(useSampler.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('write and read a sample', async () => {
    await fixtures.whenWrite(fixtures.sample, ['candle']);
    const value = await fixtures.whenRead(100, 0, 4, ['candle']);

    expect(value).toEqual(fixtures.sample);
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  return {
    sample: [
      { timestamp: 1, o: 1.1, h: 1.1, l: 1.1, c: 1.1 },
      { timestamp: 2, o: 1.1, h: 2.2, l: 1.1, c: 2.2 },
      { timestamp: 3, o: 1.1, h: 3.3, l: 1.1, c: 3.3 }
    ],

    whenWrite<T extends { timestamp: number }>(data: T[], dependencies: unknown[]) {
      return act(() => useSampler(dependencies).write(data));
    },

    whenRead<T extends { timestamp: number }>(
      count: number,
      from: number,
      to: number,
      dependencies: unknown[]
    ) {
      return act(() =>
        useSampler<T>(dependencies).read({
          count,
          from,
          to
        })
      );
    }
  };
}
