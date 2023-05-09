import { readFileSync } from 'fs';
import { join } from 'path';
import { of } from 'rxjs';

import * as whenSocket from '@lib/when-socket';
import { makeTestModule, toArray } from '@quantform/core';

import { useBinanceTradeSocket } from './use-binance-trade-socket';

describe(useBinanceTradeSocket.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('pipe a trades', async () => {
    fixtures.givenPayloadReceived(1, fixtures.payload);

    const changes = fixtures.whenTradeSocketResolved();

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
  const { act } = await makeTestModule([]);

  return {
    payload: JSON.parse(
      readFileSync(join(__dirname, 'use-binance-trade-socket.payload.json'), 'utf8')
    ),
    givenPayloadReceived(timestamp: number, payload: any) {
      jest.spyOn(whenSocket, 'whenSocket').mockReturnValue(of({ timestamp, payload }));
    },
    whenTradeSocketResolved() {
      return toArray(act(() => useBinanceTradeSocket({ raw: 'BNBBTC' } as any)));
    }
  };
}
