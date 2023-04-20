import { firstValueFrom, of } from 'rxjs';

import {
  Asset,
  Commission,
  Instrument,
  instrumentOf,
  InstrumentSelector,
  makeTestModule,
  missed,
  toArray
} from '@quantform/core';

import { useBinanceInstrument } from './use-binance-instrument';
import * as useBinanceInstruments from './use-binance-instruments';

describe(useBinanceInstrument.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('pipe instrument when subscription started', async () => {
    fixtures.givenInstrumentsReceived([
      instrumentOf('binance:btc-usdt'),
      instrumentOf('binance:eth-usdt')
    ]);

    const changes = toArray(
      fixtures.whenInstrumentResolved(instrumentOf('binance:eth-usdt'))
    );

    expect(changes).toEqual([expect.objectContaining({ id: 'binance:eth-usdt' })]);
  });

  test('pipe instrument when received new instruments for existing subscription', async () => {
    const changes = toArray(
      fixtures.whenInstrumentResolved(instrumentOf('binance:eth-usdt'))
    );

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

    const changes = toArray(
      fixtures.whenInstrumentResolved(instrumentOf('binance:xmr-usdt'))
    );

    expect(changes).toEqual([missed]);
  });

  test('pipe the same instance of instrument for same selector', async () => {
    fixtures.givenInstrumentsReceived([
      instrumentOf('binance:btc-usdt'),
      instrumentOf('binance:eth-usdt')
    ]);

    const one = await firstValueFrom(
      fixtures.whenInstrumentResolved(instrumentOf('binance:btc-usdt'))
    );
    const two = await firstValueFrom(
      fixtures.whenInstrumentResolved(instrumentOf('binance:btc-usdt'))
    );

    expect(Object.is(one, two)).toBeTruthy();
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  return {
    givenInstrumentsReceived(instruments: InstrumentSelector[]) {
      jest.spyOn(useBinanceInstruments, 'useBinanceInstruments').mockReturnValue(
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
      return act(() => useBinanceInstrument(instrument));
    }
  };
}
