import { readFileSync } from 'fs';
import { join } from 'path';
import { firstValueFrom, of } from 'rxjs';

import * as withRequest from '@lib/api/with-request';
import { makeTestModule, useExecutionMode } from '@quantform/core';

import { withExchangeInfoRequest } from './with-exchange-info-request';

describe(withExchangeInfoRequest.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('happy path', async () => {
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
    fixtures.givenResponseReceived(1, fixtures.payload);

    const changes1 = await firstValueFrom(fixtures.whenRequestResolved());

    expect(changes1).toEqual({ timestamp: 1, payload: expect.anything() });

    fixtures.givenResponseReceived(2, fixtures.payload);

    const changes2 = await firstValueFrom(fixtures.whenRequestResolved());

    expect(changes2).toEqual({ timestamp: 1, payload: expect.anything() });
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([
    useExecutionMode.liveOptions({ recording: false })
  ]);

  return {
    payload: JSON.parse(
      readFileSync(join(__dirname, 'with-exchange-info-request.payload.json'), 'utf8')
    ),
    givenResponseReceived(timestamp: number, payload: any) {
      jest.spyOn(withRequest, 'withRequest').mockReturnValue(of({ timestamp, payload }));
    },
    whenRequestResolved() {
      return act(() => withExchangeInfoRequest());
    }
  };
}
