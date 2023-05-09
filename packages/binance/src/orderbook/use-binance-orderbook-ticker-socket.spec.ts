import { readFileSync } from 'fs';
import { join } from 'path';
import { of } from 'rxjs';

import * as whenSocket from '@lib/when-socket';
import { makeTestModule, toArray } from '@quantform/core';

import { useBinanceOrderbookTickerSocket } from './use-binance-orderbook-ticker-socket';

describe(useBinanceOrderbookTickerSocket.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('pipe a message', async () => {
    fixtures.givenPayloadReceived(1, fixtures.payload);

    const changes = fixtures.whenOrderbookTickerSocketResolved();

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
  const { act } = await makeTestModule([]);

  return {
    payload: JSON.parse(
      readFileSync(
        join(__dirname, 'use-binance-orderbook-ticker-socket.payload.json'),
        'utf8'
      )
    ),
    givenPayloadReceived(timestamp: number, payload: any) {
      jest.spyOn(whenSocket, 'whenSocket').mockReturnValue(of({ timestamp, payload }));
    },
    whenOrderbookTickerSocketResolved() {
      return toArray(
        act(() => useBinanceOrderbookTickerSocket({ raw: 'BTCUSD' } as any))
      );
    }
  };
}
