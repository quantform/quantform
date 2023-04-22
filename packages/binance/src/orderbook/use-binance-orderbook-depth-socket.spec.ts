import { readFileSync } from 'fs';
import { join } from 'path';
import { of } from 'rxjs';

import * as useBinanceSocket from '@lib/use-binance-socket';
import { makeTestModule, toArray } from '@quantform/core';

import { useBinanceOrderbookDepthSocket } from './use-binance-orderbook-depth-socket';

describe(useBinanceOrderbookDepthSocket.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('pipe a message', async () => {
    fixtures.givenSocketReceived(1, fixtures.payload);

    const changes = fixtures.whenOrderbookDepthSocketResolved();

    expect(changes).toEqual([
      {
        timestamp: 1,
        payload: {
          lastUpdateId: 36130858371,
          asks: [
            ['27895.01000000', '4.14880000'],
            ['27895.02000000', '0.43590000'],
            ['27895.03000000', '0.11627000'],
            ['27895.07000000', '0.00756000'],
            ['27895.08000000', '0.08780000']
          ],
          bids: [
            ['27895.00000000', '6.91301000'],
            ['27894.99000000', '0.55171000'],
            ['27894.98000000', '0.01567000'],
            ['27894.96000000', '0.01566000'],
            ['27894.84000000', '0.01129000']
          ]
        }
      }
    ]);
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  return {
    payload: JSON.parse(
      readFileSync(
        join(__dirname, 'use-binance-orderbook-depth-socket.payload.json'),
        'utf8'
      )
    ),
    givenSocketReceived(timestamp: number, payload: any) {
      jest
        .spyOn(useBinanceSocket, 'useBinanceSocket')
        .mockReturnValue(of({ timestamp, payload }));
    },
    whenOrderbookDepthSocketResolved() {
      return toArray(
        act(() => useBinanceOrderbookDepthSocket({ raw: 'BTCUSD' } as any, '10@1000ms'))
      );
    }
  };
}
