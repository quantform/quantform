import { readFileSync } from 'fs';
import { join } from 'path';
import { firstValueFrom } from 'rxjs';

import { assetOf, AssetSelector, core, d, Module, provider } from '@quantform/core';

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

    const ape = await fixtures.whenRequested(assetOf('binance:ape'));
    const btc = await fixtures.whenRequested(assetOf('binance:btc'));

    fixtures.thenGetExchangeInfoCalledOnce();
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
  const module = new Module({
    dependencies: [
      ...core().dependencies,
      { provide: BinanceConnector, useClass: BinanceConnectorMock }
    ]
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
    whenRequested: async (asset: AssetSelector) =>
      await module.executeUsingModule(
        async () => await firstValueFrom(useBinanceBalance(asset))
      ),
    thenGetExchangeInfoCalledOnce: () => {
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
