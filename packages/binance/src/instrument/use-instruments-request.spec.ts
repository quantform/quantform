import { readFileSync } from 'fs';
import { join } from 'path';
import { firstValueFrom, of } from 'rxjs';
import waitForExpect from 'wait-for-expect';

import * as usePublicRequest from '@lib/use-public-request';
import { d, makeTestModule, toArray } from '@quantform/core';

import { useInstrumentsRequest } from './use-instruments-request';

describe(useInstrumentsRequest.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('pipe a response', async () => {
    fixtures.givenResponseReceived(1, fixtures.payload);

    const changes = await firstValueFrom(fixtures.whenRequestResolved());

    expect(changes).toEqual({
      timestamp: 1,
      payload: expect.objectContaining({
        symbols: expect.arrayContaining([
          expect.objectContaining({
            symbol: 'ETHBTC',
            baseAsset: 'ETH',
            quoteAsset: 'BTC'
          })
        ])
      })
    });
  });

  test('pipe a cached response', async () => {
    fixtures.givenResponseReceived(1, { fake: 1 });

    const changes1 = await firstValueFrom(fixtures.whenRequestResolved());

    await waitForExpect(() =>
      expect(changes1).toEqual([{ timestamp: 1, payload: { fake: 1 } }])
    );

    fixtures.givenResponseReceived(2, { fake: 2 });

    const changes2 = await firstValueFrom(fixtures.whenRequestResolved());

    await waitForExpect(() =>
      expect(changes2).toEqual([{ timestamp: 1, payload: { fake: 1 } }])
    );
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  return {
    payload: JSON.parse(
      readFileSync(join(__dirname, 'use-instruments-request.payload.json'), 'utf8')
    ),
    givenResponseReceived(timestamp: number, payload: any) {
      jest
        .spyOn(usePublicRequest, 'usePublicRequest')
        .mockReturnValue(of({ timestamp, payload }));
    },
    whenRequestResolved() {
      return act(() => useInstrumentsRequest());
    }
  };
}
