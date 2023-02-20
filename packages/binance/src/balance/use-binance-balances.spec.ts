import { readFileSync } from 'fs';
import { join } from 'path';
import { firstValueFrom } from 'rxjs';

import { makeTestModule, provider } from '@quantform/core';

import { useBinanceBalances } from './use-binance-balances';

function readMockObject(fileName: string) {
  return Promise.resolve(
    JSON.parse(readFileSync(join(__dirname, '../_MOCK_', fileName), 'utf8'))
  );
}
/*
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
    const balances = await fixtures.whenUseBinanceBalancesCalled();

    fixtures.thenGetExchangeInfoRequestedOnce();
    fixtures.thenGetAccountRequestedOnce();
    expect(Object.values(balances).length).toEqual(508);
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
    whenUseBinanceBalancesCalled: () => act(() => firstValueFrom(useBinanceBalances())),
    thenGetExchangeInfoRequestedOnce: () => {
      expect(connector.getExchangeInfo).toHaveBeenCalledTimes(1);
    },
    thenGetAccountRequestedOnce: () => {
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
*/
