import { of, tap } from 'rxjs';

import {
  Asset,
  Commission,
  Instrument,
  instrumentNotSupported,
  instrumentOf,
  InstrumentSelector,
  makeTestModule
} from '@quantform/core';

import { useInstrument } from './use-instrument';
import * as useInstruments from './use-instruments';

describe(useInstrument.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('pipe instrument when subscription started', async () => {
    fixtures.givenInstrumentsReceived([
      instrumentOf('binance:btc-usdt'),
      instrumentOf('binance:eth-usdt')
    ]);

    const changes = fixtures.whenInstrumentResolved(instrumentOf('binance:eth-usdt'));

    expect(changes).toEqual([expect.objectContaining({ id: 'binance:eth-usdt' })]);
  });

  test('pipe instrument when received new instruments for existing subscription', async () => {
    const changes = fixtures.whenInstrumentResolved(instrumentOf('binance:eth-usdt'));

    fixtures.givenInstrumentsReceived([
      instrumentOf('binance:btc-usdt'),
      instrumentOf('binance:eth-usdt')
    ]);

    expect(changes).toEqual([expect.objectContaining({ id: 'binance:eth-usdt' })]);
  });

  test('pipe instrument not found for not existing instrument', async () => {
    fixtures.givenInstrumentsReceived([
      instrumentOf('binance:btc-usdt'),
      instrumentOf('binance:eth-usdt')
    ]);

    const changes = fixtures.whenInstrumentResolved(instrumentOf('binance:xmr-usdt'));

    expect(changes).toEqual([instrumentNotSupported]);
  });

  test('pipe the same instance of instrument for same selector', async () => {
    fixtures.givenInstrumentsReceived([
      instrumentOf('binance:btc-usdt'),
      instrumentOf('binance:eth-usdt')
    ]);

    const [one] = fixtures.whenInstrumentResolved(instrumentOf('binance:btc-usdt'));
    const [two] = fixtures.whenInstrumentResolved(instrumentOf('binance:btc-usdt'));

    expect(Object.is(one, two)).toBeTruthy();
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  return {
    givenInstrumentsReceived(instruments: InstrumentSelector[]) {
      jest.spyOn(useInstruments, 'useInstruments').mockReturnValue(
        of(
          instruments.reduce((agg, it) => {
            const base = new Asset(it.base.name, it.base.adapterName, 8);
            const quote = new Asset(it.quote.name, it.base.adapterName, 8);

            agg.push(new Instrument(1, base, quote, it.id, Commission.Zero));
            return agg;
          }, Array.of<Instrument>())
        )
      );
    },
    whenInstrumentResolved(instrument: InstrumentSelector) {
      const array = Array.of<typeof instrumentNotSupported | Instrument>();

      act(() => useInstrument(instrument))
        .pipe(tap(it => array.push(it)))
        .subscribe();

      return array;
    }
  };
}
