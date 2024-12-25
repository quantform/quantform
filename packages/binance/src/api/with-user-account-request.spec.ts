import { firstValueFrom, of } from 'rxjs';

import * as withSignedRequest from '@lib/api/with-signed-request';
import { makeTestModule, useExecutionMode } from '@quantform/core';

import { withUserAccountRequest } from './with-user-account-request';

describe(withUserAccountRequest.name, () => {
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
  const { act } = await makeTestModule([
    useExecutionMode.liveOptions({ recording: false })
  ]);

  return {
    payload: {
      makerCommission: 15,
      takerCommission: 15,
      buyerCommission: 0,
      sellerCommission: 0,
      commissionRates: {
        maker: '0.00150000',
        taker: '0.00150000',
        buyer: '0.00000000',
        seller: '0.00000000'
      },
      canTrade: true,
      canWithdraw: true,
      canDeposit: true,
      brokered: false,
      requireSelfTradePrevention: false,
      updateTime: 123456789,
      accountType: 'SPOT',
      balances: [
        {
          asset: 'BTC',
          free: '4723846.89208129',
          locked: '0.00000000'
        },
        {
          asset: 'LTC',
          free: '4763368.68006011',
          locked: '0.00000000'
        }
      ],
      permissions: ['SPOT']
    },
    balance(asset: string, free: string, locked: string) {
      return { asset, free, locked };
    },
    givenResponseReceived(timestamp: number, payload: any) {
      jest
        .spyOn(withSignedRequest, 'withSignedRequest')
        .mockReturnValue(of({ timestamp, payload }));
    },
    whenUserAccountRequestResolved() {
      return act(() => withUserAccountRequest());
    }
  };
}
