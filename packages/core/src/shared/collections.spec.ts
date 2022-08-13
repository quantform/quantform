import { Liquidity, LiquidityAskComparer } from '..';
import { d, PriorityList } from '.';

describe('PriorityList', () => {
  test('should patch a best bid and ask', () => {
    const input = [
      { rate: d(2), quantity: d(2) },
      { rate: d(2), quantity: d(3) },
      { rate: d(5), quantity: d(1) },
      { rate: d(5), quantity: d(2) },
      { rate: d(3), quantity: d(1) },
      { rate: d(1), quantity: d(8) },
      { rate: d(1), quantity: d(0) },
      { rate: d(3), quantity: d(0) },
      { rate: d(5), quantity: d(0) }
    ];

    const sut = new PriorityList<Liquidity>(LiquidityAskComparer, 'rate');

    input.forEach(it => (it.quantity.greaterThan(0) ? sut.enqueue(it) : sut.dequeue(it)));

    const volume = sut.reduce((it, agg) => agg.add(it.quantity.mul(it.rate)), d.Zero);

    expect(sut.head.rate).toEqual(d(2));
    expect(sut.head.quantity).toEqual(d(3));
    expect(volume).toEqual(d(6));
    expect(sut.getByKey(2).quantity).toEqual(d(3));
    expect(sut.getByKey(3)).toEqual(undefined);
  });
});
