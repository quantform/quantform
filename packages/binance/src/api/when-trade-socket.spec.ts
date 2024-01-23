import { of } from 'rxjs';

import { liveExecutionMode, makeTestModule, toArray } from '@quantform/core';

import * as whenSocket from './when-socket';
import { whenTradeSocket } from './when-trade-socket';

describe(whenTradeSocket.name, () => {
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
          p: '0.001',
          q: '100',
          t: 12345,
          b: 88,
          a: 50,
          m: true
        }
      }
    ]);
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([liveExecutionMode({ recording: false })]);

  return {
    payload: {
      e: 'trade',
      E: 123456789,
      s: 'BNBBTC',
      t: 12345,
      p: '0.001',
      q: '100',
      b: 88,
      a: 50,
      T: 123456785,
      m: true,
      M: true
    },
    given: {
      message(timestamp: number, payload: any) {
        jest.spyOn(whenSocket, 'whenSocket').mockReturnValue(of({ timestamp, payload }));
      }
    },
    when: {
      resolved() {
        return toArray(act(() => whenTradeSocket('BNBBTC')));
      }
    }
  };
}
