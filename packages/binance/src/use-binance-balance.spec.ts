import { readFileSync } from 'fs';
import { join } from 'path';
import { firstValueFrom } from 'rxjs';

import {
  assetOf,
  AssetSelector,
  d,
  makeTestModule,
  provideExecutionMode,
  provider
} from '@quantform/core';

import { BinanceConnector } from '@lib/binance-connector';
import { useBinanceBalance } from '@lib/use-binance-balance';

function readMockObject(fileName: string) {
  return Promise.resolve(
    JSON.parse(readFileSync(join(__dirname, '_MOCK_', fileName), 'utf8'))
  );
}

describe(useBinanceBalance.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('return existing balances', async () => {
    fixtures.givenGetExchangeInfoResponse(
      readMockObject('binance-exchange-info-response.json')
    );
    fixtures.givenGetAccountResponse(readMockObject('binance-account-response.json'));

    const ape = await fixtures.whenUseBinanceBalanceCalled(assetOf('binance:ape'));
    const btc = await fixtures.whenUseBinanceBalanceCalled(assetOf('binance:btc'));

    fixtures.thenGetExchangeInfoRequestedOnce();
    expect(ape).toEqual(
      expect.objectContaining({
        available: d(10.62704),
        unavailable: d(0.5)
      })
    );
    expect(btc).toEqual(
      expect.objectContaining({
        available: d(0.00540992),
        unavailable: d(0)
      })
    );
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
    whenUseBinanceBalanceCalled: async (asset: AssetSelector) =>
      act(() => firstValueFrom(useBinanceBalance(asset))),
    thenGetExchangeInfoRequestedOnce: () => {
      expect(connector.getExchangeInfo).toHaveBeenCalledTimes(1);
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
