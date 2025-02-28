import { Observable, of, Subscriber } from 'rxjs';

import * as useBinanceOrderbookTickerSocket from '@lib/api/when-orderbook-ticker-socket';
import * as getInstrument from '@lib/instrument/get-instrument';
import * as useOptions from '@lib/use-options';
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

import { watchOrderbookTicker } from './watch-orderbook-ticker';

describe(watchOrderbookTicker.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('pipe orderbook snapshot when subscription started', async () => {
    fixtures.givenInstrumentsReceived(instrumentOf('binance:btc-usdt'));

    const changes = toArray(
      fixtures.givenOrderbookTickerResolved(instrumentOf('binance:btc-usdt'))
    );

    fixtures.watchOrderbookTickerSocketReceived(1, { b: '1', B: '2', a: '3', A: '4' });

    expect(changes).toEqual([
      {
        timestamp: 1,
        instrument: expect.objectContaining({ id: 'binance:btc-usdt' }),
        bids: { rate: d('1'), quantity: d('2') },
        asks: { rate: d('3'), quantity: d('4') }
      }
    ]);
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  let useBinanceOrderbookTickerSocketSubscriber: Subscriber<{
    timestamp: number;
    payload: any;
  }>;

  jest.spyOn(useOptions, 'useOptions').mockReturnValue({ retryDelay: undefined } as any);

  jest
    .spyOn(useBinanceOrderbookTickerSocket, 'watchOrderbookTickerSocket')
    .mockImplementation(
      () =>
        new Observable<{ timestamp: number; payload: any }>(subscriber => {
          useBinanceOrderbookTickerSocketSubscriber = subscriber;
        })
    );

  return {
    givenInstrumentsReceived(instrument: InstrumentSelector) {
      const base = new Asset(instrument.base.name, instrument.base.adapterName, 8);
      const quote = new Asset(instrument.quote.name, instrument.base.adapterName, 8);

      jest
        .spyOn(getInstrument, 'getInstrument')
        .mockReturnValue(
          of(new Instrument(1, base, quote, instrument.id, Commission.Zero))
        );
    },
    watchOrderbookTickerSocketReceived(timestamp: number, payload: any) {
      useBinanceOrderbookTickerSocketSubscriber.next({ timestamp, payload });
    },
    watchOrderbookTickerSocketErrored() {
      useBinanceOrderbookTickerSocketSubscriber.error({ failed: true });
    },
    givenOrderbookTickerResolved(instrument: InstrumentSelector) {
      return act(() => watchOrderbookTicker(instrument));
    }
  };
}
