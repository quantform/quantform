import { d, decimal } from '@quantform/core';

import { MatchingEngine } from './matching-engine';

describe(MatchingEngine.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('enqueue buy and sell orders', async () => {
    fixtures.when.sell({ id: 1, quantity: d(1), price: d(200) });
    fixtures.when.sell({ id: 2, quantity: d(1), price: d(200) });
    fixtures.when.sell({ id: 3, quantity: d(1), price: d(300) });

    fixtures.when.buy({ id: 4, quantity: d(5), price: d(100) });
    fixtures.when.buy({ id: 5, quantity: d(1), price: d(150) });
    fixtures.when.buy({ id: 6, quantity: d(2), price: d(100) });

    fixtures.then.asks([
      { cumulativeQuantity: d(2), price: d(200) },
      { cumulativeQuantity: d(1), price: d(300) }
    ]);

    fixtures.then.bids([
      { cumulativeQuantity: d(1), price: d(150) },
      { cumulativeQuantity: d(7), price: d(100) }
    ]);
  });

  describe('trade', () => {
    beforeEach(() => {
      fixtures.when.sell({ id: 1, quantity: d(1), price: d(200) });
      fixtures.when.sell({ id: 2, quantity: d(1), price: d(200) });
      fixtures.when.sell({ id: 3, quantity: d(1), price: d(300) });

      fixtures.when.buy({ id: 4, quantity: d(5), price: d(100) });
      fixtures.when.buy({ id: 5, quantity: d(1), price: d(150) });
      fixtures.when.buy({ id: 6, quantity: d(2), price: d(100) });
    });

    test('buy limit', () => {
      expect(fixtures.when.buy({ id: 7, quantity: d(3), price: d(200) })).toEqual([
        {
          quantity: d(1),
          price: d(200),
          makerOrderId: 1,
          takerOrderId: 7
        },
        {
          quantity: d(1),
          price: d(200),
          makerOrderId: 2,
          takerOrderId: 7
        }
      ]);

      fixtures.then.asks([{ cumulativeQuantity: d(1), price: d(300) }]);

      fixtures.then.bids([
        { cumulativeQuantity: d(1), price: d(200) },
        { cumulativeQuantity: d(1), price: d(150) },
        { cumulativeQuantity: d(7), price: d(100) }
      ]);
    });

    test('buy maker', () => {
      expect(fixtures.when.buy({ id: 7, quantity: d(2.5) })).toEqual([
        {
          quantity: d(1),
          price: d(200),
          makerOrderId: 1,
          takerOrderId: 7
        },
        {
          quantity: d(1),
          price: d(200),
          makerOrderId: 2,
          takerOrderId: 7
        },
        {
          quantity: d(0.5),
          price: d(300),
          makerOrderId: 3,
          takerOrderId: 7
        }
      ]);

      fixtures.then.asks([{ cumulativeQuantity: d(0.5), price: d(300) }]);

      fixtures.then.bids([
        { cumulativeQuantity: d(1), price: d(150) },
        { cumulativeQuantity: d(7), price: d(100) }
      ]);
    });

    test('buy market, insufficient liquidity', () => {
      expect(fixtures.when.buy({ id: 7, quantity: d(20) })).toEqual('REJECTED');

      fixtures.then.asks([
        { cumulativeQuantity: d(2), price: d(200) },
        { cumulativeQuantity: d(1), price: d(300) }
      ]);

      fixtures.then.bids([
        { cumulativeQuantity: d(1), price: d(150) },
        { cumulativeQuantity: d(7), price: d(100) }
      ]);
    });

    test('sell limit', () => {
      expect(fixtures.when.sell({ id: 7, quantity: d(2), price: d(150) })).toEqual([
        {
          quantity: d(1),
          price: d(150),
          makerOrderId: 5,
          takerOrderId: 7
        }
      ]);

      fixtures.then.asks([
        { cumulativeQuantity: d(1), price: d(150) },
        { cumulativeQuantity: d(2), price: d(200) },
        { cumulativeQuantity: d(1), price: d(300) }
      ]);

      fixtures.then.bids([{ cumulativeQuantity: d(7), price: d(100) }]);
    });

    test('sell market', () => {
      expect(fixtures.when.sell({ id: 7, quantity: d(2) })).toEqual([
        {
          quantity: d(1),
          price: d(150),
          makerOrderId: 5,
          takerOrderId: 7
        },
        {
          quantity: d(1),
          price: d(100),
          makerOrderId: 4,
          takerOrderId: 7
        }
      ]);

      fixtures.then.asks([
        { cumulativeQuantity: d(2), price: d(200) },
        { cumulativeQuantity: d(1), price: d(300) }
      ]);

      fixtures.then.bids([{ cumulativeQuantity: d(6), price: d(100) }]);
    });

    test('sell market, insufficient liquidity', () => {
      expect(fixtures.when.sell({ id: 7, quantity: d(20) })).toEqual('REJECTED');

      fixtures.then.asks([
        { cumulativeQuantity: d(2), price: d(200) },
        { cumulativeQuantity: d(1), price: d(300) }
      ]);

      fixtures.then.bids([
        { cumulativeQuantity: d(1), price: d(150) },
        { cumulativeQuantity: d(7), price: d(100) }
      ]);
    });
  });
});

async function getFixtures() {
  const sut = new MatchingEngine();

  return {
    when: {
      buy(order: { id: number; quantity: decimal; price?: decimal }) {
        return sut.enqueue(order, 'BUY');
      },
      sell(order: { id: number; quantity: decimal; price?: decimal }) {
        return sut.enqueue(order, 'SELL');
      }
    },
    then: {
      asks(levels: { cumulativeQuantity: decimal; price: decimal }[]) {
        expect(sut.snapshot().ask).toEqual({
          cumulativeQuantity: expect.anything(),
          levels: levels.map(it => ({ ...it, orders: expect.any(Array) }))
        });
      },
      bids(levels: { cumulativeQuantity: decimal; price: decimal }[]) {
        expect(sut.snapshot().bid).toEqual({
          cumulativeQuantity: expect.anything(),
          levels: levels.map(it => ({ ...it, orders: expect.any(Array) }))
        });
      }
    }
  };
}
