import { of, ReplaySubject } from 'rxjs';

import * as useInstrument from '@lib/instrument/use-instrument';
import * as useOrderbookTickerSocket from '@lib/orderbook/use-orderbook-ticker-socket';
import {
  Asset,
  Commission,
  d,
  Instrument,
  instrumentOf,
  InstrumentSelector,
  makeTestModule,
  toArray
} from '@quantform/core';

import { useOrderbookTicker } from './use-orderbook-ticker';

describe(useOrderbookTicker.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('pipe orderbook snapshot when subscription started', async () => {
    fixtures.givenInstrumentsReceived(instrumentOf('binance:btc-usdt'));
    fixtures.givenPayloadReceived(1, {
      s: 'BNBUSDT',
      b: '25.35190000',
      B: '31.21000000',
      a: '25.36520000',
      A: '40.66000000'
    });

    const changes = fixtures.whenOrderbookTickerResolved(
      instrumentOf('binance:btc-usdt')
    );

    expect(changes).toEqual([
      {
        timestamp: expect.any(Number),
        instrument: expect.objectContaining({ id: 'binance:btc-usdt' }),
        bids: { rate: d('25.35190000'), quantity: d('31.21000000') },
        asks: { rate: d('25.36520000'), quantity: d('40.66000000') }
      }
    ]);
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  const message = new ReplaySubject<{ timestamp: number; payload: any }>();

  jest
    .spyOn(useOrderbookTickerSocket, 'useOrderbookTickerSocket')
    .mockReturnValue(message);

  return {
    givenInstrumentsReceived(instrument: InstrumentSelector) {
      const base = new Asset(instrument.base.name, instrument.base.adapterName, 8);
      const quote = new Asset(instrument.quote.name, instrument.base.adapterName, 8);

      jest
        .spyOn(useInstrument, 'useInstrument')
        .mockReturnValue(
          of(new Instrument(1, base, quote, instrument.id, Commission.Zero))
        );
    },
    givenPayloadReceived(timestamp: number, payload: any) {
      message.next({ timestamp, payload });
    },
    whenOrderbookTickerResolved(instrument: InstrumentSelector) {
      return toArray(act(() => useOrderbookTicker(instrument)));
    }
  };
}
