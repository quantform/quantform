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
      fixtures.whenRequested(instrumentOf('binance:btc-usdt')),
      fixtures.whenRequested(instrumentOf('binance:eth-usdt')),
      fixtures.whenRequested(instrumentOf('binance:btc-usdt'))
    ]);

    console.log(btc_usdt);
    console.log(eth_usdt);

    expect(btc_usdt).toEqual(btc_usdt_replay);
  });
});

async function getFixtures() {
  const module = await makeTestModule({
    dependencies: [
      provideExecutionMode(true),
      { provide: BinanceConnector, useClass: BinanceConnectorMock }
    ]
  });

  const connector = module.get(BinanceConnector) as unknown as BinanceConnectorMock;

  return {
    givenGetExchangeInfoResponse: (response: any) => {
      connector.getExchangeInfo.mockReturnValue(response);
    },
    givenGetAccountResponse: (response: any) => {
      connector.account.mockReturnValue(response);
    },
    whenRequested: async (instrument: InstrumentSelector) =>
      await module.executeUsingModule(
        async () => await firstValueFrom(useBinanceOrderbook(instrument))
      )
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
