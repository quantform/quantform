import { firstValueFrom, of } from 'rxjs';

import * as useInstruments from '@lib/instrument/use-instruments';
import {
  Asset,
  Commission,
  Instrument,
  instrumentOf,
  InstrumentSelector,
  makeTestModule,
  toArray
} from '@quantform/core';

import { useAssets } from './use-assets';

describe(useAssets.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('pipe a collection of assets when subscription started', async () => {
    fixtures.givenInstrumentsReceived([
      instrumentOf('binance:btc-usdt'),
      instrumentOf('binance:btc-busd'),
      instrumentOf('binance:btc-usdc')
    ]);

    const changes = toArray(fixtures.whenAssetsResolved());

    expect(changes).toEqual([
      {
        'binance:btc': expect.objectContaining({ id: 'binance:btc' }),
        'binance:usdt': expect.objectContaining({ id: 'binance:usdt' }),
        'binance:busd': expect.objectContaining({ id: 'binance:busd' }),
        'binance:usdc': expect.objectContaining({ id: 'binance:usdc' })
      }
    ]);
  });

  test('pipe a collection of assets when received new assets for existing subscription', async () => {
    const changes = toArray(fixtures.whenAssetsResolved());

    fixtures.givenInstrumentsReceived([
      instrumentOf('binance:btc-usdt'),
      instrumentOf('binance:btc-busd'),
      instrumentOf('binance:btc-usdc')
    ]);

    expect(changes).toEqual([
      {
        'binance:btc': expect.objectContaining({ id: 'binance:btc' }),
        'binance:usdt': expect.objectContaining({ id: 'binance:usdt' }),
        'binance:busd': expect.objectContaining({ id: 'binance:busd' }),
        'binance:usdc': expect.objectContaining({ id: 'binance:usdc' })
      }
    ]);
  });

  test('pipe the same instances of assets', async () => {
    fixtures.givenInstrumentsReceived([
      instrumentOf('binance:btc-usdt'),
      instrumentOf('binance:btc-busd'),
      instrumentOf('binance:btc-usdc')
    ]);

    const one = await firstValueFrom(fixtures.whenAssetsResolved());
    const two = await firstValueFrom(fixtures.whenAssetsResolved());

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
    whenAssetsResolved() {
      return act(() => useAssets());
    }
  };
}
