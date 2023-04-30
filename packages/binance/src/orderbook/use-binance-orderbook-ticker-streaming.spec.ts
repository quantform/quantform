import { Observable, of, Subscriber } from 'rxjs';

import * as useBinanceInstrument from '@lib/instrument/use-binance-instrument';
import * as useBinanceOrderbookTickerSocket from '@lib/orderbook/use-binance-orderbook-ticker-socket';
import * as useBinanceOptions from '@lib/use-binance-options';
import {
  Asset,
  Commission,
  d,
  errored,
  Instrument,
  instrumentOf,
  InstrumentSelector,
  makeTestModule,
  toArray
} from '@quantform/core';

import { useBinanceOrderbookTickerStreaming } from './use-binance-orderbook-ticker-streaming';

describe(useBinanceOrderbookTickerStreaming.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('pipe orderbook snapshot when subscription started', async () => {
    fixtures.givenInstrumentsReceived(instrumentOf('binance:btc-usdt'));

    const changes = toArray(
      fixtures.givenOrderbookTickerResolved(instrumentOf('binance:btc-usdt'))
    );

    fixtures.whenOrderbookTickerSocketReceived(1, { b: '1', B: '2', a: '3', A: '4' });

    expect(changes).toEqual([
      {
        timestamp: 1,
        instrument: expect.objectContaining({ id: 'binance:btc-usdt' }),
        bids: { rate: d('1'), quantity: d('2') },
        asks: { rate: d('3'), quantity: d('4') }
      }
    ]);
  });

  test('pipe orderbook and retry in a case of error', async () => {
    fixtures.givenInstrumentsReceived(instrumentOf('binance:btc-usdt'));

    const changes = toArray(
      fixtures.givenOrderbookTickerResolved(instrumentOf('binance:btc-usdt'))
    );

    fixtures.whenOrderbookTickerSocketReceived(1, { b: '1', B: '2', a: '3', A: '4' });
    fixtures.whenOrderbookTickerSocketErrored();
    fixtures.whenOrderbookTickerSocketReceived(2, { b: '5', B: '6', a: '7', A: '8' });

    expect(changes).toEqual([
      {
        timestamp: 1,
        instrument: expect.objectContaining({ id: 'binance:btc-usdt' }),
        bids: { rate: d('1'), quantity: d('2') },
        asks: { rate: d('3'), quantity: d('4') }
      },
      errored,
      {
        timestamp: 2,
        instrument: expect.objectContaining({ id: 'binance:btc-usdt' }),
        bids: { rate: d('5'), quantity: d('6') },
        asks: { rate: d('7'), quantity: d('8') }
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

  jest
    .spyOn(useBinanceOptions, 'useBinanceOptions')
    .mockReturnValue({ retryDelay: undefined } as any);

  jest
    .spyOn(useBinanceOrderbookTickerSocket, 'useBinanceOrderbookTickerSocket')
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
        .spyOn(useBinanceInstrument, 'useBinanceInstrument')
        .mockReturnValue(
          of(new Instrument(1, base, quote, instrument.id, Commission.Zero))
        );
    },
    whenOrderbookTickerSocketReceived(timestamp: number, payload: any) {
      useBinanceOrderbookTickerSocketSubscriber.next({ timestamp, payload });
    },
    whenOrderbookTickerSocketErrored() {
      useBinanceOrderbookTickerSocketSubscriber.error({ failed: true });
    },
    givenOrderbookTickerResolved(instrument: InstrumentSelector) {
      return act(() => useBinanceOrderbookTickerStreaming(instrument));
    }
  };
}
