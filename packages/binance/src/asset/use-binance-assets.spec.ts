import { firstValueFrom, of } from 'rxjs';

import { useBinanceInstruments } from '@lib/instrument';
import {
  Asset,
  Commission,
  expectSequence,
  Instrument,
  instrumentOf,
  InstrumentSelector,
  makeTestModule,
  mockedFunc
} from '@quantform/core';

import { useBinanceAssets } from './use-binance-assets';

jest.mock('@lib/instrument', () => ({
  ...jest.requireActual('@lib/instrument'),
  useBinanceInstruments: jest.fn()
}));

describe(useBinanceAssets.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  afterEach(() => fixtures.clear());

  test('emit array of asset when subscription started', async () => {
    const { act } = fixtures;

    fixtures.givenInstrumentSupported(instrumentOf('binance:btc-usdt'));
    fixtures.givenInstrumentSupported(instrumentOf('binance:btc-busd'));
    fixtures.givenInstrumentSupported(instrumentOf('binance:btc-usdc'));

    const sequence = act(() => useBinanceAssets());

    await expectSequence(sequence, [
      {
        'binance:btc': expect.objectContaining({
          name: 'btc',
          adapterName: 'binance',
          scale: 8
        }),
        'binance:usdt': expect.objectContaining({
          name: 'usdt',
          adapterName: 'binance',
          scale: 8
        }),
        'binance:busd': expect.objectContaining({
          name: 'busd',
          adapterName: 'binance',
          scale: 8
        }),
        'binance:usdc': expect.objectContaining({
          name: 'usdc',
          adapterName: 'binance',
          scale: 8
        })
      }
    ]);

    fixtures.thenUseBinanceInstrumentsCalledOnce();
  });

  test('emit always same instance of array of asset', async () => {
    const { act } = fixtures;

    fixtures.givenInstrumentSupported(instrumentOf('binance:btc-usdt'));
    fixtures.givenInstrumentSupported(instrumentOf('binance:btc-bust'));
    fixtures.givenInstrumentSupported(instrumentOf('binance:btc-usdc'));

    const one = await firstValueFrom(act(() => useBinanceAssets()));
    const two = await firstValueFrom(act(() => useBinanceAssets()));

    expect(Object.is(one, two)).toBeTruthy();
    fixtures.thenUseBinanceInstrumentsCalledOnce();
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  const instruments: Instrument[] = [];

  const useBinanceInstrumentsMock = mockedFunc(useBinanceInstruments).mockImplementation(
    () => of(instruments)
  );

  return {
    act,
    givenInstrumentSupported(instrument: InstrumentSelector) {
      const base = new Asset(instrument.base.name, instrument.base.adapterName, 8);
      const quote = new Asset(instrument.quote.name, instrument.base.adapterName, 8);

      instruments.push(new Instrument(1, base, quote, instrument.id, Commission.Zero));
    },
    thenUseBinanceInstrumentsCalledOnce() {
      expect(useBinanceInstrumentsMock).toBeCalledTimes(1);
    },
    clear: jest.clearAllMocks
  };
}
