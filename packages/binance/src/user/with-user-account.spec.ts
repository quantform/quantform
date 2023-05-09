import { readFileSync } from 'fs';
import { join } from 'path';
import { firstValueFrom, of } from 'rxjs';

import * as withSignedRequest from '@lib/with-signed-request';
import { makeTestModule } from '@quantform/core';

import { withUserAccount } from './with-user-account';

describe(withUserAccount.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('pipe a user account response', async () => {
    fixtures.givenResponseReceived(1, fixtures.payload);

    const changes = await firstValueFrom(fixtures.whenUserAccountRequestResolved());

    expect(changes).toEqual({
      timestamp: 1,
      payload: expect.objectContaining({
        makerCommission: 15,
        takerCommission: 15,
        balances: expect.arrayContaining([
          fixtures.balance('BTC', '4723846.89208129', '0.00000000'),
          fixtures.balance('LTC', '4763368.68006011', '0.00000000')
        ])
      })
    });
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  return {
    payload: JSON.parse(
      readFileSync(join(__dirname, 'with-user-account.payload.json'), 'utf8')
    ),
    balance(asset: string, free: string, locked: string) {
      return { asset, free, locked };
    },
    givenResponseReceived(timestamp: number, payload: any) {
      jest
        .spyOn(withSignedRequest, 'withSignedRequest')
        .mockReturnValue(of({ timestamp, payload }));
    },
    whenUserAccountRequestResolved() {
      return act(() => withUserAccount());
    }
  };
}
