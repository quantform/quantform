import { of } from 'rxjs';

import { liveExecutionMode, makeTestModule, toArray } from '@quantform/core';

import { whenOrderbookTickerSocket } from './when-orderbook-ticker-socket';
import * as whenSocket from './when-socket';

describe(whenOrderbookTickerSocket.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('happy path', async () => {
    fixtures.given.message(1, fixtures.payload);

    const changes = fixtures.when.resolved();

    expect(changes).toEqual([
      {
        timestamp: 1,
        payload: {
          A: '2.15212000',
          B: '10.13438000',
          a: '27890.91000000',
          b: '27890.90000000'
        }
      }
    ]);
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([liveExecutionMode({ recording: false })]);

  return {
    payload: {
      u: 36130903413,
      s: 'BTCUSDT',
      b: '27890.90000000',
      B: '10.13438000',
      a: '27890.91000000',
      A: '2.15212000'
    },
    given: {
      message(timestamp: number, payload: any) {
        jest.spyOn(whenSocket, 'whenSocket').mockReturnValue(of({ timestamp, payload }));
      }
    },
    when: {
      resolved() {
        return toArray(act(() => whenOrderbookTickerSocket('BTCUSD')));
      }
    }
  };
}
