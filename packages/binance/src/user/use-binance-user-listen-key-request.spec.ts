import { readFileSync } from 'fs';
import { join } from 'path';
import { firstValueFrom, of } from 'rxjs';

import * as useBinanceCredentials from '@lib/use-binance-credentials';
import * as useBinanceRequest from '@lib/use-binance-request';
import { makeTestModule } from '@quantform/core';

import { useBinanceUserListenKeyRequest } from './use-binance-user-listen-key-request';

describe(useBinanceUserListenKeyRequest.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('pipe a user listen key response', async () => {
    fixtures.givenResponseReceived(1, fixtures.payload);
    fixtures.givenCredentials({ apiKey: 'test-key' });

    const changes = await firstValueFrom(fixtures.whenListenKeyRequestResolved());

    expect(changes).toEqual({
      timestamp: 1,
      payload: {
        listenKey: 'pqia91ma19a5s61cv6a81va65sdf19v8a65a1a5s61cv6a81va65sdf19v8a65a1'
      }
    });
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  return {
    payload: JSON.parse(
      readFileSync(
        join(__dirname, 'use-binance-user-listen-key-request.payload.json'),
        'utf8'
      )
    ),
    givenCredentials(credentials: { apiKey: string }) {
      jest
        .spyOn(useBinanceCredentials, 'useBinanceCredentials')
        .mockReturnValue(of(credentials) as any);
    },
    givenResponseReceived(timestamp: number, payload: any) {
      jest
        .spyOn(useBinanceRequest, 'useBinanceRequest')
        .mockReturnValue(of({ timestamp, payload }));
    },
    whenListenKeyRequestResolved() {
      return act(() => useBinanceUserListenKeyRequest());
    }
  };
}
