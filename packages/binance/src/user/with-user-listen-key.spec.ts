import { readFileSync } from 'fs';
import { join } from 'path';
import { firstValueFrom, of } from 'rxjs';

import * as useCredentials from '@lib/use-credentials';
import * as withRequest from '@lib/with-request';
import { makeTestModule } from '@quantform/core';

import { withUserListenKey } from './with-user-listen-key';

describe(withUserListenKey.name, () => {
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
      readFileSync(join(__dirname, 'with-user-listen-key.payload.json'), 'utf8')
    ),
    givenCredentials(credentials: { apiKey: string }) {
      jest
        .spyOn(useCredentials, 'useCredentials')
        .mockReturnValue(of(credentials) as any);
    },
    givenResponseReceived(timestamp: number, payload: any) {
      jest.spyOn(withRequest, 'withRequest').mockReturnValue(of({ timestamp, payload }));
    },
    whenListenKeyRequestResolved() {
      return act(() => withUserListenKey());
    }
  };
}
