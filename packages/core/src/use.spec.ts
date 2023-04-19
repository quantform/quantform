import { makeTestModule } from '@lib/make-test-module';

import { instrumentOf, InstrumentSelector } from './instrument';
import { use } from './use';

describe(use.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('memorize same values for same arguments', () => {
    const { act, getValue } = fixtures;

    act(() => {
      const value1 = getValue(instrumentOf('binance:btc-usdt'));
      const value2 = getValue(instrumentOf('binance:btc-usdt'));

      expect(Object.is(value1, value2)).toBeTruthy();
    });
  });

  test('memorize different values for different arguments', () => {
    const { act, getValue } = fixtures;

    act(() => {
      const value1 = getValue(instrumentOf('binance:btc-usdt'));
      const value2 = getValue(instrumentOf('binance:btc-busd'));

      expect(value1).toEqual('binance:btc-usdt');
      expect(value2).toEqual('binance:btc-busd');
    });
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  const getValue = use((instrument: InstrumentSelector) => instrument.id);

  return {
    act,
    getValue: act(() => (instrument: InstrumentSelector) => getValue(instrument))
  };
}
