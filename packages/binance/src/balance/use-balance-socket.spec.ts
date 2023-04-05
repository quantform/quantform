import { readFileSync } from 'fs';
import { join } from 'path';
import { Subject } from 'rxjs';

import * as useUserSocket from '@lib/user/use-user-socket';
import { d, makeTestModule, toArray } from '@quantform/core';

import { useBalanceSocket } from './use-balance-socket';

describe(useBalanceSocket.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('pipe a message', () => {
    const changes = toArray(fixtures.whenBalanceSocketResolved());

    fixtures.payload.forEach((it, idx) => fixtures.givenPayloadReceived(idx, it));

    expect(changes).toEqual([
      {
        timestamp: 0,
        assetSelector: 'binance:bnb',
        available: d(0),
        unavailable: d(0)
      },
      {
        timestamp: 0,
        assetSelector: 'binance:usdt',
        available: d(0.07843133),
        unavailable: d(0)
      },
      {
        timestamp: 1,
        assetSelector: 'binance:ape',
        available: d(10.62704),
        unavailable: d(0)
      },
      {
        timestamp: 2,
        assetSelector: 'binance:bnb',
        available: d(2),
        unavailable: d(0)
      }
    ]);
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  const message = new Subject();

  jest
    .spyOn(useUserSocket, 'useUserSocket')
    .mockReturnValue(message.asObservable() as any);

  return {
    payload: JSON.parse(
      readFileSync(join(__dirname, 'use-balance-socket.payload.json'), 'utf8')
    ) as Array<any>,
    givenPayloadReceived(timestamp: number, payload: any) {
      message.next({ timestamp, payload });
    },
    whenBalanceSocketResolved() {
      return act(() => useBalanceSocket());
    }
  };
}
