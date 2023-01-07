import { useStore } from '@lib/useStore';

describe(useStore.name, () => {
  let fixtures: ReturnType<typeof getFixtures>;

  beforeEach(() => {
    fixtures = getFixtures();
  });

  test('dispatch initial state on subscription', () => {
    const store = fixtures.givenStore(
      {
        timestamp: 1,
        quantity: 10,
        rate: 100
      },
      ['test-1']
    );
    fixtures.whenSubscriptionStarted(store);
    fixtures.thenSequenceReceived([{ timestamp: 1, quantity: 10, rate: 100 }]);
  });

  test('state patched, changes dispatched', () => {
    const store = fixtures.givenStore(
      {
        timestamp: 1,
        quantity: 10,
        rate: 100
      },
      ['test-2']
    );
    fixtures.whenSubscriptionStarted(store);
    fixtures.whenStorePatched(store, { timestamp: 2, quantity: 11 });
    fixtures.thenSequenceReceived([
      { timestamp: 1, quantity: 10, rate: 100 },
      { timestamp: 2, quantity: 11, rate: 100 }
    ]);
  });

  test('timestamp not patched, no changes dispatched', () => {
    const store = fixtures.givenStore(
      {
        timestamp: 1,
        quantity: 10,
        rate: 100
      },
      ['test-3']
    );
    fixtures.whenSubscriptionStarted(store);
    fixtures.whenStorePatched(store, { quantity: 11 });
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
    givenStore(state: ComponentState, dependencies: unknown[]) {
      return useStore<ComponentState>(state, dependencies);
    },
    whenSubscriptionStarted(store: ReturnType<typeof useStore<ComponentState>>) {
      return store.select(it => it).subscribe(it => values.push({ ...it }));
    },
    whenStorePatched(
      store: ReturnType<typeof useStore<ComponentState>>,
      state: Partial<ComponentState>
    ) {
      store.setState(state);
    },
    thenSequenceReceived(state: ComponentState[]) {
      expect(values).toEqual(state);
    }
  };
}
