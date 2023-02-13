import { firstValueFrom, of, toArray } from 'rxjs';

import { useBinanceSocket } from '@lib/use-binance-socket';
import {
  Asset,
  Commission,
  d,
  Instrument,
  makeTestModule,
  mockedFunc
} from '@quantform/core';

import { useBinanceOrderbookDepth } from './use-binance-orderbook-depth';

jest.mock('@lib/use-binance-socket', () => ({
  ...jest.requireActual('@lib/use-binance-socket'),
  useBinanceSocket: jest.fn()
}));

describe(useBinanceOrderbookDepth.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('stream orderbook ticker changes', async () => {
    fixtures.givenPayloadReceived({
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

    const depth = await fixtures.whenUseOrderbookDepth();

    expect(depth).toEqual([
      {
        timestamp: expect.any(Number),
        instrument: fixtures.instrument,
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
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  return {
    sample: {},
    instrument: new Instrument(
      0,
      new Asset('btc', 'binance', 8),
      new Asset('usdt', 'binance', 4),
      'BTCUSDT',
      Commission.Zero
    ),
    givenPayloadReceived(payload: any) {
      mockedFunc(useBinanceSocket).mockReturnValueOnce(of(payload));
    },
    whenUseOrderbookDepth() {
      return act(() =>
        firstValueFrom(
          useBinanceOrderbookDepth(this.instrument, '10@100ms').pipe(toArray())
        )
      );
    }
  };
}
