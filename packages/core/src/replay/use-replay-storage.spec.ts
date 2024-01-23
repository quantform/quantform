import { makeTestModule, mockedFunc } from '@lib/make-test-module';
import { Query, QueryObject, Storage } from '@lib/storage';
import { useStorage } from '@lib/storage';

import { useReplayStorage } from './use-replay-storage';

jest.mock('@lib/storage', () => ({
  ...jest.requireActual('@lib/storage'),
  useStorage: jest.fn()
}));

describe(useReplayStorage.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  describe('query', () => {
    test('happy path', async () => {
      await fixtures.given.stored(fixtures.sample);
      const sample = await fixtures.when.queried({});

      expect(sample).toEqual(fixtures.sample);
    });
  });

  describe('save', () => {
    test('happy path', async () => {
      await fixtures.when.saved(fixtures.sample);
      await fixtures.then.stored(fixtures.sample);
    });
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  const dependencies = ['binance:btc-usdt', 'candle', 'h1'];
  const save: Storage['save'] = jest.fn();
  const query: jest.MockedFunction<Storage['query']> = jest.fn();

  mockedFunc(useStorage).mockReturnValue({ save, query } as any);

  return {
    sample: [
      { timestamp: 1, payload: { o: 1.1, h: 1.1, l: 1.1, c: 1.1 } },
      { timestamp: 2, payload: { o: 1.1, h: 2.2, l: 1.1, c: 2.2 } },
      { timestamp: 3, payload: { o: 1.1, h: 3.3, l: 1.1, c: 3.3 } }
    ],

    given: {
      stored<T>(sample: { timestamp: number; payload: T }[]) {
        return query.mockReturnValue(
          Promise.resolve(
            sample.map(it => ({
              timestamp: it.timestamp,
              payload: JSON.stringify(it.payload)
            }))
          )
        );
      }
    },
    when: {
      saved<T>(sample: { timestamp: number; payload: T }[]) {
        return act(() => useReplayStorage(dependencies).save(sample));
      },
      queried<T>(query: Query<QueryObject>) {
        return act(() => useReplayStorage<T>(dependencies).query(query));
      }
    },

    then: {
      stored<T>(sample: { timestamp: number; payload: T }[]) {
        expect(save).toHaveBeenCalledWith(
          expect.anything(),
          sample.map(it => ({
            timestamp: it.timestamp,
            payload: JSON.stringify(it.payload)
          }))
        );
      }
    }
  };
}
