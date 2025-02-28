import { retry, Subject } from 'rxjs';

import * as getInstruments from '@lib/instrument/get-instruments';
import {
  Asset,
  Commission,
  Instrument,
  instrumentOf,
  InstrumentSelector,
  makeTestModule,
  toArray
} from '@quantform/core';

import { getAssets } from './get-assets';

describe(getAssets.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('happy path', () => {
    const changes = toArray(fixtures.when.assets());

    fixtures.given.instruments.changed([
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

  test('instruments errored', () => {
    const changes = toArray(fixtures.when.assets().pipe(retry(1)));

    fixtures.given.instruments.errored();

    expect(changes).toEqual([expect.any(Error)]);
  });

  test('same instances of assets', () => {
    const one = toArray(fixtures.when.assets());
    const two = toArray(fixtures.when.assets());

    fixtures.given.instruments.changed([
      instrumentOf('binance:btc-usdt'),
      instrumentOf('binance:btc-busd'),
      instrumentOf('binance:btc-usdc')
    ]);

    expect(one).toEqual(two);
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  const instruments = new Subject<Instrument[]>();

  jest
    .spyOn(getInstruments, 'getInstruments')
    .mockReturnValue(instruments.asObservable());

  return {
    given: {
      instruments: {
        changed(selectors: InstrumentSelector[]) {
          instruments.next(
            selectors.reduce((agg, it) => {
              agg.push(
                new Instrument(
                  1,
                  new Asset(it.base.name, it.base.adapterName, 8),
                  new Asset(it.quote.name, it.base.adapterName, 8),
                  it.id,
                  Commission.Zero
                )
              );
              return agg;
            }, Array.of<Instrument>())
          );
        },
        errored() {
          instruments.error(new Error());
        }
      }
    },
    when: {
      assets() {
        return act(() => getAssets());
      }
    }
  };
}
