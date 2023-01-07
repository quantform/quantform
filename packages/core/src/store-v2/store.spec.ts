import { Store } from '@lib/store-v2/store';

describe(Store.name, () => {
  let fixtures: ReturnType<typeof getFixtures>;

  beforeEach(() => {
    fixtures = getFixtures();
  });

  test('dispatch initial state on subscription', () => {
    const store = fixtures.givenStore({
      timestamp: 1,
      quantity: 10,
      rate: 100
    });
    fixtures.whenSubscriptionStarted(store);
    fixtures.thenSequenceReceived([{ timestamp: 1, quantity: 10, rate: 100 }]);
  });

  test('state patched, changes dispatched', () => {
    const store = fixtures.givenStore({
      timestamp: 1,
      quantity: 10,
      rate: 100
    });
    fixtures.whenSubscriptionStarted(store);
    fixtures.whenStorePatched(store, { timestamp: 2, quantity: 11 });
    fixtures.thenSequenceReceived([
      { timestamp: 1, quantity: 10, rate: 100 },
      { timestamp: 2, quantity: 11, rate: 100 }
    ]);
  });

  test('timestamp not patched, no changes dispatched', () => {
    const store = fixtures.givenStore({
      timestamp: 1,
      quantity: 10,
      rate: 100
    });
    fixtures.whenSubscriptionStarted(store);
    fixtures.whenStorePatched(store, { timestamp: 1, quantity: 11 });
    fixtures.thenSequenceReceived([{ timestamp: 1, quantity: 10, rate: 100 }]);
  });
});

function getFixtures() {
  type ComponentState = {
    timestamp: number;
    quantity: number;
    rate: number;
  };

  const values = Array.of<ComponentState>();

  return {
    givenStore(state: ComponentState) {
      return new Store<ComponentState>(state);
    },
    whenSubscriptionStarted(store: Store<ComponentState>) {
      return store.select(it => it).subscribe(it => values.push({ ...it }));
    },
    whenStorePatched(store: Store<ComponentState>, state: Partial<ComponentState>) {
      store.patch(current => {
        Object.assign(current, state);
      });
    },
    thenSequenceReceived(state: ComponentState[]) {
      expect(values).toEqual(state);
    }
  };
}
