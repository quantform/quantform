import { readFileSync } from 'fs';
import { join } from 'path';
import { firstValueFrom } from 'rxjs';

import { makeTestModule, provider, withExecutionMode } from '@quantform/core';

import { BinanceConnector } from '@lib/binance-connector';

import { useBinanceAssets } from './use-binance-assets';

function readMockObject(fileName: string) {
  return Promise.resolve(
    JSON.parse(readFileSync(join(__dirname, '../_MOCK_', fileName), 'utf8'))
  );
}

describe(useBinanceAssets.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('get balances', async () => {
    fixtures.givenGetExchangeInfoResponse(
      readMockObject('binance-exchange-info-response.json')
    );
    fixtures.givenGetAccountResponse(readMockObject('binance-account-response.json'));
    const assets = await fixtures.whenUseBinanceAssetsCalled();

    fixtures.thenGetExchangeInfoRequestedOnce();
    fixtures.thenGetAccountRequestedOnce();
    expect(Object.values(assets).length).toEqual(508);
  });
});

async function getFixtures() {
  const { act, get } = await makeTestModule([
    withExecutionMode(true),
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
    whenUseBinanceAssetsCalled: async () => act(() => firstValueFrom(useBinanceAssets())),
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
