import { readFileSync } from 'fs';
import { join } from 'path';
import { firstValueFrom, of } from 'rxjs';

import * as withRequest from '@lib/with-request';
import { makeTestModule } from '@quantform/core';

import { withExchangeInfo } from './with-exchange-info';

describe(withExchangeInfo.name, () => {
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
    fixtures.givenResponseReceived(1, fixtures.payload);

    const changes1 = await firstValueFrom(fixtures.whenRequestResolved());

    expect(changes1).toEqual({ timestamp: 1, payload: expect.anything() });

    fixtures.givenResponseReceived(2, fixtures.payload);

    const changes2 = await firstValueFrom(fixtures.whenRequestResolved());

    expect(changes2).toEqual({ timestamp: 1, payload: expect.anything() });
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  return {
    payload: JSON.parse(
      readFileSync(join(__dirname, 'with-exchange-info.payload.json'), 'utf8')
    ),
    givenResponseReceived(timestamp: number, payload: any) {
      jest.spyOn(withRequest, 'withRequest').mockReturnValue(of({ timestamp, payload }));
    },
    whenRequestResolved() {
      return act(() => withExchangeInfo());
    }
  };
}
