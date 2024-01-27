import { d, decimal } from '@quantform/core';

import { MatchingEnginePriceLevel } from './matching-engine-price-level';

describe(MatchingEnginePriceLevel.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('happy path', async () => {
    fixtures.given.order({ id: 1, quantity: d(1) });
    fixtures.given.order({ id: 2, quantity: d(2) });
    fixtures.given.order({ id: 3, quantity: d(3) });

    expect(fixtures.when.trade({ id: 4, quantity: d(1.5) })).toEqual([
      { quantity: d(1), price: d(1), makerOrderId: 1, takerOrderId: 4 },
      { quantity: d(0.5), price: d(1), makerOrderId: 2, takerOrderId: 4 }
    ]);

    expect(fixtures.when.cancel({ id: 3 })).toEqual({ id: 3, quantityLeft: d(3) });

    fixtures.then.orders([{ id: 2, quantityLeft: d(1.5) }]);
  });
});

async function getFixtures() {
  const sut = new MatchingEnginePriceLevel(d(1));

  return {
    given: {
      order(order: { id: number; quantity: decimal }) {
        sut.enqueue(order);
      }
    },
    when: {
      trade(order: { id: number; quantity: decimal }) {
        return sut.trade(order);
      },
      cancel(order: { id: number }) {
        return sut.dequeue(order);
      }
    },
    then: {
      orders(orders: { id: number; quantityLeft: decimal }[]) {
        expect(sut.snapshot().orders).toEqual(orders);
      }
    }
  };
}
