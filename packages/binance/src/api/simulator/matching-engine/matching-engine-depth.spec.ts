import { d } from '@quantform/core';

import { MatchingEngineDepth } from './matching-engine-depth';

describe(MatchingEngineDepth.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('bid', async () => {
    const sut = fixtures.given.depth('BID');

    sut.enqueue({ id: 1, quantity: d(1), price: d(100) });
    sut.enqueue({ id: 2, quantity: d(2), price: d(100) });
    sut.enqueue({ id: 3, quantity: d(3), price: d(300) });
    sut.enqueue({ id: 4, quantity: d(4), price: d(100) });
    sut.enqueue({ id: 5, quantity: d(5), price: d(400) });

    expect(sut.trade({ id: 6, quantity: d(7), price: d(300) })).toEqual([
      {
        makerOrderId: 5,
        takerOrderId: 6,
        quantity: d(5),
        price: d(400)
      },
      {
        makerOrderId: 3,
        takerOrderId: 6,
        quantity: d(2),
        price: d(300)
      }
    ]);

    expect(sut.dequeue({ id: 1 })).toEqual({ id: 1, quantityLeft: d(1) });

    expect(sut.snapshot()).toEqual({
      cumulativeQuantity: d(7),
      levels: [
        { price: d(300), cumulativeQuantity: d(1), orders: expect.any(Array) },
        { price: d(100), cumulativeQuantity: d(6), orders: expect.any(Array) }
      ]
    });
  });

  test('ask', async () => {
    const sut = fixtures.given.depth('ASK');

    sut.enqueue({ id: 1, quantity: d(1), price: d(100) });
    sut.enqueue({ id: 2, quantity: d(2), price: d(100) });
    sut.enqueue({ id: 3, quantity: d(3), price: d(300) });
    sut.enqueue({ id: 4, quantity: d(4), price: d(100) });
    sut.enqueue({ id: 5, quantity: d(5), price: d(400) });

    expect(sut.trade({ id: 6, quantity: d(7), price: d(300) })).toEqual([
      {
        makerOrderId: 1,
        takerOrderId: 6,
        quantity: d(1),
        price: d(100)
      },
      {
        makerOrderId: 2,
        takerOrderId: 6,
        quantity: d(2),
        price: d(100)
      },
      {
        makerOrderId: 4,
        takerOrderId: 6,
        quantity: d(4),
        price: d(100)
      }
    ]);

    expect(sut.snapshot()).toEqual({
      cumulativeQuantity: d(8),
      levels: [
        { price: d(300), cumulativeQuantity: d(3), orders: expect.any(Array) },
        { price: d(400), cumulativeQuantity: d(5), orders: expect.any(Array) }
      ]
    });
  });
});

async function getFixtures() {
  return {
    given: {
      depth(side: 'BID' | 'ASK') {
        return new MatchingEngineDepth(side);
      }
    }
  };
}
