import { DictionaryStore } from '@lib/store-v2/dictionary-store';

describe(DictionaryStore.name, () => {
  let fixtures: ReturnType<typeof getFixtures>;

  beforeEach(() => {
    fixtures = getFixtures();
  });

  test('dispatch initial state on subscription for key', () => {
    const store = fixtures.givenDictionaryStore({
      ['binance:btc']: {
        timestamp: 1,
        name: 'binance:btc',
        quantity: 11
      },
      ['binance:eth']: {
        timestamp: 1,
        name: 'binance:eth',
        quantity: 12
      },
      ['binance:usdt']: {
        timestamp: 1,
        name: 'binance:usdt',
        quantity: 13
      }
    });
    fixtures.whenSubscriptionStartedForKey(store, 'binance:eth');
    fixtures.whenSubscriptionStartedForKey(store, 'binance:btc');
    fixtures.thenSequenceReceived([
      { timestamp: 1, name: 'binance:eth', quantity: 12 },
      { timestamp: 1, name: 'binance:btc', quantity: 11 }
    ]);
  });

  test('state patched, changes dispatched', () => {
    const store = fixtures.givenDictionaryStore({
      ['binance:btc']: {
        timestamp: 1,
        name: 'binance:btc',
        quantity: 10
      },
      ['binance:eth']: {
        timestamp: 1,
        name: 'binance:eth',
        quantity: 10
      },
      ['binance:usdt']: {
        timestamp: 1,
        name: 'binance:usdt',
        quantity: 10
      }
    });
    fixtures.whenSubscriptionStartedForKey(store, 'binance:eth');
    fixtures.whenStorePatchedForKey(store, 'binance:eth', { timestamp: 2, quantity: 11 });
    fixtures.whenStorePatchedForKey(store, 'binance:eth', { timestamp: 3, quantity: 12 });
    fixtures.thenSequenceReceived([
      { timestamp: 1, name: 'binance:eth', quantity: 10 },
      { timestamp: 2, name: 'binance:eth', quantity: 11 },
      { timestamp: 3, name: 'binance:eth', quantity: 12 }
    ]);
  });

  test('timestamp not patched, no changes dispatched', () => {
    const store = fixtures.givenDictionaryStore({
      ['binance:btc']: {
        timestamp: 1,
        name: 'binance:btc',
        quantity: 10
      },
      ['binance:eth']: {
        timestamp: 1,
        name: 'binance:eth',
        quantity: 10
      },
      ['binance:usdt']: {
        timestamp: 1,
        name: 'binance:usdt',
        quantity: 10
      }
    });
    fixtures.whenSubscriptionStartedForKey(store, 'binance:usdt');
    fixtures.whenStorePatchedForKey(store, 'binance:usdt', {
      timestamp: 1,
      quantity: 11
    });
    fixtures.thenSequenceReceived([{ timestamp: 1, name: 'binance:usdt', quantity: 10 }]);
  });
});

function getFixtures() {
  type ComponentState = {
    timestamp: number;
    name: string;
    quantity: number;
  };

  const values = Array.of<ComponentState>();

  return {
    givenDictionaryStore(state: Record<string, ComponentState>) {
      return new DictionaryStore<ComponentState>(state);
    },
    whenSubscriptionStartedForKey(store: DictionaryStore<ComponentState>, key: string) {
      return store.select(key, it => it).subscribe(it => values.push({ ...it }));
    },
    whenStorePatchedForKey(
      store: DictionaryStore<ComponentState>,
      key: string,
      state: Partial<ComponentState>
    ) {
      store.patch(key, current => {
        Object.assign(current, state);
      });
    },
    thenSequenceReceived(state: ComponentState[]) {
      expect(values).toEqual(state);
    }
  };
}
