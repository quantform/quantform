import { from, map } from 'rxjs';

import { Binance } from '@quantform/binance';
import { expectSequence, Instrument, makeTestModule } from '@quantform/core';

import { useOrderSettled } from './use-order-settled';

describe(useOrderSettled.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test.each<[string[][], string[]]>([
    [[['1']], ['1']],
    [
      [['1'], ['2'], ['3']],
      ['1', '2', '3']
    ],
    [
      [[], ['1'], ['2'], ['3']],
      ['1', '2', '3']
    ],
    [
      [[], ['1'], ['1', '2', '3'], ['3'], ['3']],
      ['1', '2', '3']
    ],
    [
      [['1', '2', '3'], ['1', '2', '3'], ['3']],
      ['1', '2', '3']
    ],
    [
      [['1', '2', '3'], ['1', '2', '3'], ['3'], [], [], ['4']],
      ['1', '2', '3', '4']
    ]
  ])('emits settled orders one by one', async (inp, out) => {
    fixtures.givenOrdersChanged(inp);

    const orders = fixtures.whenOrderSettledRequested();

    await expectSequence(orders, out);
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([...Binance({})]);
  const instrument = {} as any as Instrument;

  return {
    givenOrdersChanged(orders: string[][]) {
      Binance.useOrders = jest.fn().mockReturnValue(
        from(
          orders.map(it =>
            it.reduce((p, c) => {
              p[c] = { id: c };
              return p;
            }, {} as Record<string, unknown>)
          )
        )
      );
    },
    whenOrderSettledRequested() {
      return act(() => useOrderSettled(instrument)).pipe(map(it => it.id));
    }
  };
}
