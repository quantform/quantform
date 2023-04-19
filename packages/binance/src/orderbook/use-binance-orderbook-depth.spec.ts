import { of, ReplaySubject } from 'rxjs';

import * as useBinanceInstrument from '@lib/instrument/use-binance-instrument';
import * as useBinanceOrderbookDepthSocket from '@lib/orderbook/use-binance-orderbook-depth-socket';
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

import { useBinanceOrderbookDepth } from './use-binance-orderbook-depth';

describe(useBinanceOrderbookDepth.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('pipe orderbook snapshot when subscription started', async () => {
    fixtures.givenInstrumentsReceived(instrumentOf('binance:btc-usdt'));
    fixtures.givenPayloadReceived(1, {
      lastUpdateId: 31308012629,
      bids: [
        ['22567.63000000', '0.11219000'],
        ['22567.62000000', '0.22154000'],
        ['22567.39000000', '0.02965000'],
        ['22567.26000000', '0.11088000'],
        ['22567.00000000', '0.03557000'],
        ['22566.93000000', '0.00066000'],
        ['22566.92000000', '0.02354000'],
        ['22566.79000000', '0.02000000'],
        ['22566.60000000', '0.11073000'],
        ['22566.56000000', '0.15508000']
      ],
      asks: [
        ['22568.90000000', '0.03408000'],
        ['22568.91000000', '0.00066000'],
        ['22568.93000000', '0.00100000'],
        ['22568.98000000', '0.01159000'],
        ['22569.02000000', '0.00100000'],
        ['22569.03000000', '0.02748000'],
        ['22569.04000000', '0.29380000'],
        ['22569.05000000', '0.13640000'],
        ['22569.06000000', '0.03558000'],
        ['22569.07000000', '0.02518000']
      ]
    });

    const changes = fixtures.whenOrderbookDepthResolved(instrumentOf('binance:btc-usdt'));

    expect(changes).toEqual([
      {
        timestamp: 1,
        instrument: expect.objectContaining({ id: 'binance:btc-usdt' }),
        level: '10@100ms',
        bids: [
          { rate: d('22567.63000000'), quantity: d('0.11219000') },
          { rate: d('22567.62000000'), quantity: d('0.22154000') },
          { rate: d('22567.39000000'), quantity: d('0.02965000') },
          { rate: d('22567.26000000'), quantity: d('0.11088000') },
          { rate: d('22567.00000000'), quantity: d('0.03557000') },
          { rate: d('22566.93000000'), quantity: d('0.00066000') },
          { rate: d('22566.92000000'), quantity: d('0.02354000') },
          { rate: d('22566.79000000'), quantity: d('0.02000000') },
          { rate: d('22566.60000000'), quantity: d('0.11073000') },
          { rate: d('22566.56000000'), quantity: d('0.15508000') }
        ],
        asks: [
          { rate: d('22568.90000000'), quantity: d('0.03408000') },
          { rate: d('22568.91000000'), quantity: d('0.00066000') },
          { rate: d('22568.93000000'), quantity: d('0.00100000') },
          { rate: d('22568.98000000'), quantity: d('0.01159000') },
          { rate: d('22569.02000000'), quantity: d('0.00100000') },
          { rate: d('22569.03000000'), quantity: d('0.02748000') },
          { rate: d('22569.04000000'), quantity: d('0.29380000') },
          { rate: d('22569.05000000'), quantity: d('0.13640000') },
          { rate: d('22569.06000000'), quantity: d('0.03558000') },
          { rate: d('22569.07000000'), quantity: d('0.02518000') }
        ]
      }
    ]);
  });

  test('pipe orderbook updates for instrument', async () => {
    fixtures.givenInstrumentsReceived(instrumentOf('binance:btc-usdt'));
    const changes = fixtures.whenOrderbookDepthResolved(instrumentOf('binance:btc-usdt'));

    fixtures.givenPayloadReceived(1, {
      lastUpdateId: 31308012629,
      bids: [['1', '1.1']],
      asks: [['2', '2.2']]
    });
    fixtures.givenPayloadReceived(2, {
      lastUpdateId: 31308012629,
      bids: [['3', '3.3']],
      asks: [['4', '4.4']]
    });
    fixtures.givenPayloadReceived(3, {
      lastUpdateId: 31308012629,
      bids: [['5', '5.5']],
      asks: [['6', '6.6']]
    });

    expect(changes).toEqual([
      expect.objectContaining({
        timestamp: 1,
        bids: [{ rate: d('1'), quantity: d('1.1') }],
        asks: [{ rate: d('2'), quantity: d('2.2') }]
      }),
      expect.objectContaining({
        timestamp: 2,
        bids: [{ rate: d('3'), quantity: d('3.3') }],
        asks: [{ rate: d('4'), quantity: d('4.4') }]
      }),
      expect.objectContaining({
        timestamp: 3,
        bids: [{ rate: d('5'), quantity: d('5.5') }],
        asks: [{ rate: d('6'), quantity: d('6.6') }]
      })
    ]);
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  const message = new ReplaySubject<{ timestamp: number; payload: any }>();

  jest
    .spyOn(useBinanceOrderbookDepthSocket, 'useBinanceOrderbookDepthSocket')
    .mockReturnValue(message);

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
    givenPayloadReceived(timestamp: number, payload: any) {
      message.next({ timestamp, payload });
    },
    whenOrderbookDepthResolved(instrument: InstrumentSelector) {
      return toArray(act(() => useBinanceOrderbookDepth(instrument, '10@100ms')));
    }
  };
}
