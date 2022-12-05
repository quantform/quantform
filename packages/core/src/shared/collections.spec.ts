import { Liquidity, LiquidityAskComparer } from '@lib/domain';
import { d, PriorityList } from '@lib/shared';

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

    const sut = new PriorityList<Liquidity>(LiquidityAskComparer, it =>
      it.rate.toString()
    );

    input.forEach(it => (it.quantity.greaterThan(0) ? sut.enqueue(it) : sut.dequeue(it)));

    const volume = sut.reduce((it, agg) => agg.add(it.quantity.mul(it.rate)), d.Zero);

    const head = sut.head ?? fail();

    expect(head.rate).toEqual(d(2));
    expect(head.quantity).toEqual(d(3));
    expect(volume).toEqual(d(6));
    expect(sut.getByKey(d(2).toString()).quantity).toEqual(d(3));
    expect(sut.getByKey(d(3).toString())).toEqual(undefined);
  });
});
