import { from } from 'rxjs';

import { binance } from '@quantform/binance';
import { d, decimal, expectSequence, Instrument, makeTestModule } from '@quantform/core';

import { useCumulativeVolume } from './use-cumulative-volume';

describe(useCumulativeVolume.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('calculate volume', async () => {
    const { act, instrument } = fixtures;

    fixtures.givenTradesExecuted([
      { quantity: d(1), rate: d(1) },
      { quantity: d(1.5), rate: d(1) },
      { quantity: d(2), rate: d(1) },
      { quantity: d(0.5), rate: d(1) }
    ]);

    const volume = act(() => useCumulativeVolume(instrument));

    expectSequence(volume, [d(1), d(2.5), d(4.5), d(5)]);
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([...binance({})]);

  return {
    act,
    instrument: {} as any as Instrument,
    givenTradesExecuted(trades: { quantity: decimal; rate: decimal }[]) {
      binance.useTrade = jest.fn().mockReturnValue(
        from(
          trades.map(it => ({
            timestamp: 0,
            instrument: this.instrument,
            ...it
          }))
        )
      );
    }
  };
}
