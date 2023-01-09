import { readFileSync } from 'fs';
import { join } from 'path';
import { firstValueFrom } from 'rxjs';

import { Module, provider } from '@quantform/core';

import { BinanceConnector } from '@lib/binance-connector';
import { useBinanceBalances } from '@lib/use-binance-balances';

function readMockObject(fileName: string) {
  return Promise.resolve(
    JSON.parse(readFileSync(join(__dirname, '_MOCK_', fileName), 'utf8'))
  );
}

describe(useBinanceBalances.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('get balances', async () => {
    fixtures.givenGetExchangeInfoResponse(
      readMockObject('binance-exchange-info-response.json')
    );
    fixtures.givenGetAccountResponse(readMockObject('binance-account-response.json'));
    const balances = await fixtures.whenRequested();

    fixtures.thenGetExchangeInfoCalledOnce();
    fixtures.thenGetAccountCalledOnce();
    expect(Object.values(balances).length).toEqual(508);
  });
});

async function getFixtures() {
  const module = new Module({
    dependencies: [{ provide: BinanceConnector, useClass: BinanceConnectorMock }]
  });

  await module.awake();

  const connector = module.get(BinanceConnector) as unknown as BinanceConnectorMock;

  return {
    givenGetExchangeInfoResponse: (response: any) => {
      connector.getExchangeInfo.mockReturnValue(response);
    },
    givenGetAccountResponse: (response: any) => {
      connector.account.mockReturnValue(response);
    },
    whenRequested: async () =>
      await module.executeUsingModule(
        async () => await firstValueFrom(useBinanceBalances())
      ),
    thenGetExchangeInfoCalledOnce: () => {
      expect(connector.getExchangeInfo).toHaveBeenCalledTimes(1);
    },
    thenGetAccountCalledOnce: () => {
      expect(connector.account).toHaveBeenCalledTimes(1);
    }
  };
}

@provider()
class BinanceConnectorMock
  implements Pick<BinanceConnector, 'useServerTime' | 'getExchangeInfo' | 'account'>
{
  useServerTime: jest.MockedFunction<BinanceConnector['useServerTime']> = jest.fn();
  getExchangeInfo: jest.MockedFunction<BinanceConnector['getExchangeInfo']> = jest.fn();
  account: jest.MockedFunction<BinanceConnector['account']> = jest.fn();
}
