import { finalize, lastValueFrom, Subject, tap } from 'rxjs';

import { makeTestModule } from '@lib/make-test-module';
import { useSampler } from '@lib/useSampler';
import { useSampleStreamer, useSampleStreaming } from '@lib/useSampleStreamer';

describe(useSampleStreamer.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('stream single data', async () => {
    await fixtures.givenSampleStored(fixtures.sample, ['candle']);
    const finalize = fixtures.whenUseSampleStreamingCalled(['candle']);
    await fixtures.whenUseSampleStreamerStarted();

    expect(await finalize).toEqual(fixtures.sample);
  });

  test('stream multiple data', async () => {
    await fixtures.givenSampleStored(fixtures.sample, ['candle2']);
    await fixtures.givenSampleStored(fixtures.sample, ['candle1']);
    const candle1 = fixtures.whenUseSampleStreamingCalled(['candle1']);
    const candle2 = fixtures.whenUseSampleStreamingCalled(['candle2']);
    await fixtures.whenUseSampleStreamerStarted();

    expect(await candle1).toEqual(fixtures.sample);
    expect(await candle2).toEqual(fixtures.sample);
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

    givenSampleStored<T extends { timestamp: number }>(
      sample: T[],
      dependencies: unknown[]
    ) {
      act(() => {
        const { write } = useSampler(dependencies);

        return write(sample);
      });
    },

    whenUseSampleStreamingCalled<T extends { timestamp: number }>(
      dependencies: unknown[]
    ) {
      return new Promise<T[]>(resolve => {
        const sample = Array.of<T>();

        return act(() =>
          lastValueFrom(
            useSampleStreaming<T>(new Subject<T>(), dependencies).pipe(
              tap(it => sample.push(it)),
              finalize(() => resolve(sample))
            )
          )
        );
      });
    },

    whenUseSampleStreamerStarted() {
      act(() => {
        const { tryContinue } = useSampleStreamer();

        tryContinue();
      });
    }
  };
}
