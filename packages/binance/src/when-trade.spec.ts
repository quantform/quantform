import { Observable, of, Subscriber } from 'rxjs';

import * as useBinanceTradeSocket from '@lib/api/when-trade-socket';
import * as useOptions from '@lib/use-options';
import * as withInstrument from '@lib/with-instrument';
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

import { whenTrade } from './when-trade';

describe(whenTrade.name, () => {
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
      m: true
    });

    expect(changes).toEqual([
      {
        timestamp: 1,
        instrument: expect.objectContaining({ id: 'binance:btc-usdt' }),
        rate: d('0.001'),
        quantity: d('100'),
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

  jest.spyOn(useOptions, 'useOptions').mockReturnValue({ retryDelay: undefined } as any);

  jest.spyOn(useBinanceTradeSocket, 'whenTradeSocket').mockImplementation(
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
        .spyOn(withInstrument, 'withInstrument')
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
      return act(() => whenTrade(instrument));
    }
  };
}
