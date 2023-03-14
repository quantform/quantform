import { makeTestModule, mockedFunc } from '@lib/make-test-module';
import { Storage } from '@lib/storage';
import { useHash } from '@lib/use-hash';

import { useReplayStorage } from './use-replay-storage';
import { useReplayWriter } from './use-replay-writer';

jest.mock('./use-replay-storage', () => ({
  ...jest.requireActual('./use-replay-storage'),
  useReplayStorage: jest.fn()
}));

describe(useReplayWriter.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('write sample candle data to storage', async () => {
    await fixtures.whenReplayDataWritten(fixtures.sample);
    await fixtures.thenReplayDataSaved(fixtures.sample);
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  const dependencies = ['binance:btc-usdt', 'candle', 'h1'];
  const save: Storage['save'] = jest.fn();

  mockedFunc(useReplayStorage).mockReturnValue({ save } as any);

  return {
    sample: [
      { timestamp: 1, payload: { o: 1.1, h: 1.1, l: 1.1, c: 1.1 } },
      { timestamp: 2, payload: { o: 1.1, h: 2.2, l: 1.1, c: 2.2 } },
      { timestamp: 3, payload: { o: 1.1, h: 3.3, l: 1.1, c: 3.3 } }
    ],

    whenReplayDataWritten<T>(data: { timestamp: number; payload: T }[]) {
      return act(() => useReplayWriter(dependencies)(data));
    },

    async thenReplayDataSaved<T>(data: { timestamp: number; payload: T }[]) {
      expect(save).toHaveBeenCalledWith(
        useHash(dependencies),
        data.map(it => ({
          kind: 'sample',
          timestamp: it.timestamp,
          json: JSON.stringify(it.payload)
        }))
      );
    }
  };
}
