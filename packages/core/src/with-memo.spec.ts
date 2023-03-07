import { makeTestModule } from '@lib/make-test-module';

import { instrumentOf, InstrumentSelector } from './instrument';
import { withMemo } from './with-memo';

describe(withMemo.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('memorize different arguments for same hook', () => {
    const { act } = fixtures;

    const fn = withMemo((instrument: InstrumentSelector) => instrument.id);

    act(() => {
      const value1 = fn(instrumentOf('binance:btc-usdt'));
      const value2 = fn(instrumentOf('binance:btc-busd'));

      expect(value1).toEqual('binance:btc-usdt');
      expect(value2).toEqual('binance:btc-busd');
    });
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  return {
    act
  };
}
