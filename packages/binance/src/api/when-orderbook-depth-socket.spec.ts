import { of } from 'rxjs';

import { makeTestModule, toArray, useExecutionMode } from '@quantform/core';

import { whenOrderbookDepthSocket } from './when-orderbook-depth-socket';
import * as whenSocket from './when-socket';

describe(whenOrderbookDepthSocket.name, () => {
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
  const { act } = await makeTestModule([
    useExecutionMode.liveOptions({ recording: false })
  ]);

  return {
    payload: {
      lastUpdateId: 36130858371,
      bids: [
        ['27895.00000000', '6.91301000'],
        ['27894.99000000', '0.55171000'],
        ['27894.98000000', '0.01567000'],
        ['27894.96000000', '0.01566000'],
        ['27894.84000000', '0.01129000']
      ],
      asks: [
        ['27895.01000000', '4.14880000'],
        ['27895.02000000', '0.43590000'],
        ['27895.03000000', '0.11627000'],
        ['27895.07000000', '0.00756000'],
        ['27895.08000000', '0.08780000']
      ]
    },
    given: {
      message(timestamp: number, payload: any) {
        jest.spyOn(whenSocket, 'whenSocket').mockReturnValue(of({ timestamp, payload }));
      }
    },
    when: {
      resolved() {
        return toArray(act(() => whenOrderbookDepthSocket('BTCUSD', '10@1000ms')));
      }
    }
  };
}
