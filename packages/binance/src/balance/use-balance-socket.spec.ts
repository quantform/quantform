import { readFileSync } from 'fs';
import { join } from 'path';
import { of } from 'rxjs';

import * as useUserSocket from '@lib/user/use-user-socket';
import { d, makeTestModule, toArray } from '@quantform/core';

import { useBalanceSocket } from './use-balance-socket';

describe(useBalanceSocket.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('pipe a message', () => {
    fixtures.givenPayloadReceived(1, fixtures.payload);

    const changes = toArray(fixtures.whenOrderbookDepthSocketResolved());

    expect(changes).toEqual([
      {
        timestamp: 1,
        assetSelector: 'binance:bnb',
        available: d(0),
        unavailable: d(0)
      },
      {
        timestamp: 1,
        assetSelector: 'binance:usdt',
        available: d(0.07843133),
        unavailable: d(0)
      },
      {
        timestamp: 1,
        assetSelector: 'binance:ape',
        available: d(10.62704),
        unavailable: d(0)
      }
    ]);
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  return {
    payload: JSON.parse(
      readFileSync(join(__dirname, 'use-balance-socket.payload.json'), 'utf8')
    ),
    givenPayloadReceived(timestamp: number, payload: any) {
      jest
        .spyOn(useUserSocket, 'useUserSocket')
        .mockReturnValue(of({ timestamp, payload }));
    },
    whenOrderbookDepthSocketResolved() {
      return act(() => useBalanceSocket());
    }
  };
}
