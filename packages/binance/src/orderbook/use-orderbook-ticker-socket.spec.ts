import { readFileSync } from 'fs';
import { join } from 'path';
import { of } from 'rxjs';

import * as useReadonlySocket from '@lib/use-readonly-socket';
import { makeTestModule, toArray } from '@quantform/core';

import { useOrderbookTickerSocket } from './use-orderbook-ticker-socket';

describe(useOrderbookTickerSocket.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('pipe a message', async () => {
    fixtures.givenPayloadReceived(1, fixtures.payload);

    const changes = fixtures.whenOrderbookDepthSocketResolved();

    expect(changes).toEqual([
      {
        timestamp: 1,
        payload: {
          A: '2.15212000',
          B: '10.13438000',
          a: '27890.91000000',
          b: '27890.90000000',
          s: 'BTCUSDT',
          u: 36130903413
        }
      }
    ]);
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  return {
    payload: JSON.parse(
      readFileSync(join(__dirname, 'use-orderbook-ticker-socket.payload.json'), 'utf8')
    ),
    givenPayloadReceived(timestamp: number, payload: any) {
      jest
        .spyOn(useReadonlySocket, 'useReadonlySocket')
        .mockReturnValue(of({ timestamp, payload }));
    },
    whenOrderbookDepthSocketResolved() {
      return toArray(act(() => useOrderbookTickerSocket({ raw: 'BTCUSD' } as any)));
    }
  };
}
