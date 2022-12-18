import { firstValueFrom, Observable } from 'rxjs';

import { Asset, Balance, fromBalance } from '@lib/component';
import { useContext } from '@lib/shared';
import { Store } from '@lib/store';

describe(fromBalance.name, () => {
  let fixtures: ReturnType<typeof getFixtures>;

  beforeEach(() => {
    fixtures = getFixtures();
  });

  test('emit balance changes for subscription', async () => {
    const balance$ = await fixtures.givenBalanceSubscriptionStarted();
    fixtures.whenBalanceChanged();
    await fixtures.thenBalanceChangesReceived(balance$);
  });

  test('emit balance changes when subscription started', async () => {
    fixtures.whenBalanceChanged();
    const balance$ = await fixtures.givenBalanceSubscriptionStarted();
    await fixtures.thenBalanceChangesReceived(balance$);
  });
});

function getFixtures() {
  const store = useContext(Store);
  const asset = new Asset('binance', 'btc', 4);
  const balance = new Balance(1, asset);

  return {
    givenBalanceSubscriptionStarted: () => fromBalance(asset),

    whenBalanceChanged: () => {
      store.snapshot.balance.upsert(balance);
    },

    thenBalanceChangesReceived: async (balance$: Observable<Readonly<Balance>>) => {
      expect(await firstValueFrom(balance$)).toEqual(balance);
    }
  };
}
