import { makeTestModule, mockedFunc } from '@lib/make-test-module';
import { gt, Storage } from '@lib/storage';

import { useReplayReader } from './use-replay-reader';
import { useReplayStorage } from './use-replay-storage';

jest.mock('./use-replay-storage', () => ({
  ...jest.requireActual('./use-replay-storage'),
  useReplayStorage: jest.fn()
}));

describe(useReplayReader.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('read sample candle data from storage', async () => {
    await fixtures.givenDataStored(fixtures.sample);
    const data = await fixtures.whenDataRequested();

    expect(data).toEqual(fixtures.sample);
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  const dependencies = ['binance:btc-usdt', 'candle', 'h1'];
  const query: jest.MockedFunction<Storage['query']> = jest.fn();

  mockedFunc(useReplayStorage).mockReturnValue({ query } as any);

  return {
    sample: [
      { timestamp: 1, payload: { o: 1.1, h: 1.1, l: 1.1, c: 1.1 } },
      { timestamp: 2, payload: { o: 1.1, h: 2.2, l: 1.1, c: 2.2 } },
      { timestamp: 3, payload: { o: 1.1, h: 3.3, l: 1.1, c: 3.3 } }
    ],

    givenDataStored<T>(data: { timestamp: number; payload: T }[]) {
      return query.mockReturnValue(
        Promise.resolve(
          data.map(it => ({
            kind: 'sample',
            timestamp: it.timestamp,
            json: JSON.stringify(it.payload)
          }))
        )
      );
    },

    async whenDataRequested<T>() {
      return await act(() =>
        useReplayReader<T>(dependencies)({
          where: {
            timestamp: gt(0)
          }
        })
      );
    }
  };
}
