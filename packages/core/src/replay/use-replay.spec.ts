import { from, lastValueFrom, tap } from 'rxjs';

import { makeTestModule } from '@lib/make-test-module';
import { replayExecutionMode } from '@lib/use-execution-mode';
import { dependency } from '@lib/use-hash';

import { between } from '..';
import { useReplay } from './use-replay';
import { replayOptions } from './use-replay-options';
/*

describe.skip(useReplayCoordinator.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('return single data stream for single data source', async () => {
    fixtures.givenRecordingEnabled(false);
    await fixtures.givenSampleStored(fixtures.sample1, ['sample1']);

    const sample1 = fixtures.whenUseReplayCalled(fixtures.sample1, ['sample']);
    await fixtures.whenUseSampleStreamerStarted();

    expect(await sample1).toEqual(fixtures.sample1);
  });

  test('return combined data stream for multiple data sources', async () => {
    fixtures.givenRecordingEnabled(false);
    await fixtures.givenSampleStored(fixtures.sample1, ['sample1']);
    await fixtures.givenSampleStored(fixtures.sample2, ['sample2']);

    const sample1 = fixtures.whenUseReplayCalled(fixtures.sample1, ['sample1']);
    const sample2 = fixtures.whenUseReplayCalled(fixtures.sample2, ['sample2']);
    await fixtures.whenUseSampleStreamerStarted();

    expect(await sample1).toEqual(fixtures.sample1);
    expect(await sample2).toEqual(fixtures.sample2);
  });

  test('record and write data stream into storage', async () => {
    fixtures.givenRecordingEnabled(true);
    const sample1 = await fixtures.whenUseReplayCalled(fixtures.sample1, ['sample1x']);
    const sample2 = await fixtures.whenUseReplayCalled(fixtures.sample2, ['sample2x']);

    fixtures.thenReplaySampleStored(sample1, ['sample1x']);
    fixtures.thenReplaySampleStored(sample2, ['sample2x']);
  });
});

async function getFixtures() {
  const executionMode = replayExecutionMode();

  const { act } = await makeTestModule([
    executionMode,
    replayOptions({ from: 0, to: Number.MAX_VALUE })
  ]);

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

    givenRecordingEnabled(recording: boolean) {
      executionMode.useValue.recording = recording;
    },

    givenSampleStored<T>(
      sample: { timestamp: number; payload: T }[],
      dependencies: dependency[]
    ) {
      return act(() => {
        const writer = useReplayWriter(dependencies);

        return writer(sample);
      });
    },

    async whenUseReplayCalled<T>(
      input: { timestamp: number; payload: T }[],
      dependencies: dependency[]
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
        const { tryContinue } = useReplayCoordinator();

        tryContinue();
      });
    },

    async thenReplaySampleStored<T extends { timestamp: number }>(
      sample: T[],
      dependencies: dependency[]
    ) {
      const stored = await act(() => {
        const reader = useReplayReader(dependencies);

        return reader({
          where: {
            timestamp: between(
              sample[0].timestamp,
              sample[sample.length - 1].timestamp + 1
            )
          }
        });
      });

      expect(stored).toEqual(sample);
    }
  };
}
*/
