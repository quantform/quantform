import { Observable, of, Subscriber } from 'rxjs';

import * as useBinanceInstrument from '@lib/instrument/use-binance-instrument';
import * as useBinanceTradeSocket from '@lib/trade/use-binance-trade-socket';
import * as useBinanceOptions from '@lib/use-binance-options';
import {
  Asset,
  Commission,
  d,
  Instrument,
  instrumentOf,
  InstrumentSelector,
  makeTestModule,
  missed,
  toArray
} from '@quantform/core';

import { useBinanceTrade } from './use-binance-trade';

describe(useBinanceTrade.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('pipe trades when subscription started', async () => {
    fixtures.givenInstrumentsReceived(instrumentOf('binance:btc-usdt'));

    const changes = toArray(
      fixtures.givenTradeResolved(instrumentOf('binance:btc-usdt'))
    );

    fixtures.whenTradeSocketReceived(1, {
      p: '0.001',
      q: '100',
      t: 12345,
      b: 88,
      a: 50,
      m: true
    });

    expect(changes).toEqual([
      {
        timestamp: 1,
        instrument: expect.objectContaining({ id: 'binance:btc-usdt' }),
        rate: d('0.001'),
        quantity: d('100'),
        buyerOrderId: 88,
        sellerOrderId: 50,
        isBuyerMarketMaker: true
      }
    ]);
  });

  test('pipe trades and retry in a case of error', async () => {
    fixtures.givenInstrumentsReceived(instrumentOf('binance:btc-usdt'));

    const changes = toArray(
      fixtures.givenTradeResolved(instrumentOf('binance:btc-usdt'))
    );

    fixtures.whenTradeSocketReceived(1, {
      p: '0.001',
      q: '100',
      t: 12345,
      b: 88,
      a: 50,
      m: true
    });
    fixtures.whenTradeSocketErrored();
    fixtures.whenTradeSocketReceived(2, {
      p: '0.002',
      q: '200',
      t: 12345,
      b: 88,
      a: 50,
      m: true
    });

    expect(changes).toEqual([
      {
        timestamp: 1,
        instrument: expect.objectContaining({ id: 'binance:btc-usdt' }),
        rate: d('0.001'),
        quantity: d('100'),
        buyerOrderId: 88,
        sellerOrderId: 50,
        isBuyerMarketMaker: true
      },
      missed,
      {
        timestamp: 2,
        instrument: expect.objectContaining({ id: 'binance:btc-usdt' }),
        rate: d('0.002'),
        quantity: d('200'),
        buyerOrderId: 88,
        sellerOrderId: 50,
        isBuyerMarketMaker: true
      }
    ]);
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  let useBinanceTradeSocketSubscriber: Subscriber<{
    timestamp: number;
    payload: any;
  }>;

  jest
    .spyOn(useBinanceOptions, 'useBinanceOptions')
    .mockReturnValue({ retryDelay: undefined } as any);

  jest.spyOn(useBinanceTradeSocket, 'useBinanceTradeSocket').mockImplementation(
    () =>
      new Observable<{ timestamp: number; payload: any }>(subscriber => {
        useBinanceTradeSocketSubscriber = subscriber;
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
    whenTradeSocketReceived(timestamp: number, payload: any) {
      useBinanceTradeSocketSubscriber.next({ timestamp, payload });
    },
    whenTradeSocketErrored() {
      useBinanceTradeSocketSubscriber.error({ failed: true });
    },
    givenTradeResolved(instrument: InstrumentSelector) {
      return act(() => useBinanceTrade(instrument));
    }
  };
}
