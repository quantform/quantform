import { from, lastValueFrom, tap } from 'rxjs';

import { makeTestModule } from '@lib/make-test-module';
import { useBacktesting } from '@lib/useBacktesting';
import { useReplay } from '@lib/useReplay';
import { useSampler } from '@lib/useSampler';

import { IExecutionMode, withExecutionMode } from './useExecutionMode';

describe(useBacktesting.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('stream single data', async () => {
    fixtures.givenMode({ mode: 'TEST', recording: false });
    await fixtures.givenSampleStored(fixtures.sample1, ['sample1']);

    const sample1 = fixtures.whenUseReplayCalled(fixtures.sample1, ['sample']);
    await fixtures.whenUseSampleStreamerStarted();

    expect(await sample1).toEqual(fixtures.sample1);
  });

  test('stream multiple data', async () => {
    fixtures.givenMode({ mode: 'TEST', recording: false });
    await fixtures.givenSampleStored(fixtures.sample1, ['sample1']);
    await fixtures.givenSampleStored(fixtures.sample2, ['sample2']);

    const sample1 = fixtures.whenUseReplayCalled(fixtures.sample1, ['sample1']);
    const sample2 = fixtures.whenUseReplayCalled(fixtures.sample2, ['sample2']);
    await fixtures.whenUseSampleStreamerStarted();

    expect(await sample1).toEqual(fixtures.sample1);
    expect(await sample2).toEqual(fixtures.sample2);
  });

  test('should write replay sample to storage', async () => {
    fixtures.givenMode({ mode: 'TEST', recording: true });
    const sample1 = await fixtures.whenUseReplayCalled(fixtures.sample1, ['sample1x']);
    const sample2 = await fixtures.whenUseReplayCalled(fixtures.sample2, ['sample2x']);

    fixtures.thenReplaySampleStored(sample1, ['sample1x']);
    fixtures.thenReplaySampleStored(sample2, ['sample2x']);
  });
});

async function getFixtures() {
  const executionMode = { mode: 'TEST', recording: true } as IExecutionMode;

  const { act } = await makeTestModule([withExecutionMode(executionMode)]);

  return {
    sample1: [
      { timestamp: 1, payload: { o: 111, h: 112, l: 113, c: 114 } },
      { timestamp: 2, payload: { o: 121, h: 122, l: 123, c: 124 } },
      { timestamp: 3, payload: { o: 131, h: 132, l: 133, c: 134 } }
    ],
    sample2: [
      { timestamp: 1, payload: { o: 211, h: 212, l: 213, c: 214 } },
      { timestamp: 2, payload: { o: 221, h: 222, l: 223, c: 224 } },
      { timestamp: 3, payload: { o: 231, h: 232, l: 233, c: 234 } }
    ],

    givenMode({ mode, recording }: IExecutionMode) {
      executionMode.mode = mode;
      executionMode.recording = recording;
    },

    givenSampleStored<T>(
      sample: { timestamp: number; payload: T }[],
      dependencies: unknown[]
    ) {
      return act(() => {
        const { write } = useSampler(dependencies);

        return write(sample);
      });
    },

    async whenUseReplayCalled<T>(
      input: { timestamp: number; payload: T }[],
      dependencies: unknown[]
    ) {
      const sample = Array.of<{ timestamp: number; payload: T }>();

      await act(() =>
        lastValueFrom(
          useReplay<T>(from(input), dependencies).pipe(tap(it => sample.push(it)))
        )
      );

      return sample;
    },

    whenUseSampleStreamerStarted() {
      act(() => {
        const { tryContinue } = useBacktesting();

        tryContinue();
      });
    },

    async thenReplaySampleStored<T extends { timestamp: number }>(
      sample: T[],
      dependencies: unknown[]
    ) {
      const stored = await act(() => {
        const { read } = useSampler(dependencies);

        return read({
          count: sample.length,
          from: sample[0].timestamp,
          to: sample[sample.length - 1].timestamp + 1
        });
      });

      expect(stored).toEqual(sample);
    }
  };
}
