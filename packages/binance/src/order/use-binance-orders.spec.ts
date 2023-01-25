import { readFileSync } from 'fs';
import { join } from 'path';
import { firstValueFrom } from 'rxjs';

import { BinanceConnector } from '@lib/binance-connector';
import { d, instrumentOf, makeTestModule, provider } from '@quantform/core';

import { useBinanceOrders } from './use-binance-orders';

function readMockObject(fileName: string) {
  return Promise.resolve(
    JSON.parse(readFileSync(join(__dirname, '../_MOCK_', fileName), 'utf8'))
  );
}

describe(useBinanceOrders.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('initialize connector when requested', async () => {
    fixtures.givenGetExchangeInfoResponse(
      readMockObject('binance-exchange-info-response.json')
    );
    fixtures.givenGetAccountResponse(readMockObject('binance-account-response.json'));
    fixtures.givenGetOpenOrdersResponse(
      readMockObject('binance-open-orders-response.json')
    );

    const openOrders = await fixtures.whenUseBinanceOpenOrdersCalled();

    expect(openOrders).toEqual([
      {
        timestamp: expect.any(Number),
        instrument: expect.objectContaining({
          id: 'binance:btc-usdt'
        }),
        binanceId: 17691936021,
        quantity: d(0.00383),
        quantityExecuted: d(0),
        rate: d(19600.0),
        averageExecutionRate: undefined,
        createdAt: 1674468796767
      }
    ]);
  });
});

async function getFixtures() {
  const { act, get } = await makeTestModule([
    { provide: BinanceConnector, useClass: BinanceConnectorMock }
  ]);

  const connector = get(BinanceConnector) as unknown as BinanceConnectorMock;

  return {
    givenGetExchangeInfoResponse: (response: any) => {
      connector.getExchangeInfo.mockReturnValue(response);
    },
    givenGetAccountResponse: (response: any) => {
      connector.account.mockReturnValue(response);
    },
    givenGetOpenOrdersResponse: (response: any) => {
      connector.openOrders.mockReturnValue(response);
    },
    whenUseBinanceOpenOrdersCalled: () =>
      act(() => firstValueFrom(useBinanceOrders(instrumentOf('binance:btc-usdt'))))
  };
}

@provider()
class BinanceConnectorMock
  extends BinanceConnector
  implements
    Pick<
      BinanceConnector,
      'useServerTime' | 'getExchangeInfo' | 'account' | 'openOrders'
    >
{
  useServerTime: jest.MockedFunction<BinanceConnector['useServerTime']> = jest.fn();
  getExchangeInfo: jest.MockedFunction<BinanceConnector['getExchangeInfo']> = jest.fn();
  account: jest.MockedFunction<BinanceConnector['account']> = jest.fn();
  openOrders: jest.MockedFunction<BinanceConnector['openOrders']> = jest.fn();
}
