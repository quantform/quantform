import { readFileSync } from 'fs';
import { join } from 'path';
import { firstValueFrom } from 'rxjs';

import {
  instrumentOf,
  InstrumentSelector,
  makeTestModule,
  provideExecutionMode,
  provider
} from '@quantform/core';

import { BinanceConnector } from '@lib/binance-connector';
import { useBinanceOrderbook } from '@lib/use-binance-orderbook';

function readMockObject(fileName: string) {
  return Promise.resolve(
    JSON.parse(readFileSync(join(__dirname, '_MOCK_', fileName), 'utf8'))
  );
}

describe(useBinanceOrderbook.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('initialize connector when requested', async () => {
    fixtures.givenGetExchangeInfoResponse(
      readMockObject('binance-exchange-info-response.json')
    );
    fixtures.givenGetAccountResponse(readMockObject('binance-account-response.json'));

    const [btc_usdt, eth_usdt, btc_usdt_replay] = await Promise.all([
      fixtures.whenUseBinanceOrderbookCalled(instrumentOf('binance:btc-usdt')),
      fixtures.whenUseBinanceOrderbookCalled(instrumentOf('binance:eth-usdt')),
      fixtures.whenUseBinanceOrderbookCalled(instrumentOf('binance:btc-usdt'))
    ]);

    expect(Object.is(btc_usdt, btc_usdt_replay)).toBeTruthy();
  });
});

async function getFixtures() {
  const { act, get } = await makeTestModule([
    provideExecutionMode(true),
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
    whenUseBinanceOrderbookCalled: (instrument: InstrumentSelector) =>
      act(() => firstValueFrom(useBinanceOrderbook(instrument)))
  };
}

@provider()
class BinanceConnectorMock
  extends BinanceConnector
  implements Pick<BinanceConnector, 'useServerTime' | 'getExchangeInfo' | 'account'>
{
  useServerTime: jest.MockedFunction<BinanceConnector['useServerTime']> = jest.fn();
  getExchangeInfo: jest.MockedFunction<BinanceConnector['getExchangeInfo']> = jest.fn();
  account: jest.MockedFunction<BinanceConnector['account']> = jest.fn();
}
