import { makeTestModule } from '@lib/make-test-module';
import { useStore } from '@lib/useStore';

describe(useStore.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('dispatch initial state on subscription', () => {
    const store = fixtures.givenStore(
      {
        timestamp: 1,
        quantity: 10,
        rate: 100
      },
      ['test']
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
      ['test']
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
      ['test']
    );
    fixtures.whenSubscriptionStarted(store);
    fixtures.whenStorePatched(store, { quantity: 11 });
    fixtures.thenSequenceReceived([{ timestamp: 1, quantity: 10, rate: 100 }]);
  });
});

async function getFixtures() {
  type ComponentState = {
    timestamp: number;
    quantity: number;
    rate: number;
  };

  const values = Array.of<ComponentState>();

  const module = await makeTestModule({ dependencies: [] });

  return {
    givenStore(state: ComponentState, dependencies: unknown[]) {
      return module.executeUsingModule(() =>
        useStore<ComponentState>(state, dependencies)
      );
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
