import { readFileSync } from 'fs';
import { join } from 'path';
import { firstValueFrom } from 'rxjs';

import { Module, provider } from '@quantform/core';

import { BinanceConnector } from '@lib/binance-connector';
import { useBinanceInstruments } from '@lib/use-binance-instruments';

function readMockObject(fileName: string) {
  return Promise.resolve(
    JSON.parse(readFileSync(join(__dirname, '_MOCK_', fileName), 'utf8'))
  );
}

describe(useBinanceInstruments.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('initialize connector when requested', async () => {
    fixtures.givenGetExchangeInfoResponse(
      readMockObject('binance-exchange-info-response.json')
    );
    const instruments = await fixtures.whenRequested();

    fixtures.thenGetExchangeInfoCalledOnce();
    expect(instruments.length).toEqual(2027);
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
    whenRequested: async () =>
      await module.executeUsingModule(
        async () => await firstValueFrom(useBinanceInstruments())
      ),
    thenGetExchangeInfoCalledOnce: () => {
      expect(connector.getExchangeInfo).toHaveBeenCalledTimes(1);
    }
  };
}

@provider()
class BinanceConnectorMock
  implements Pick<BinanceConnector, 'useServerTime' | 'getExchangeInfo'>
{
  useServerTime: jest.MockedFunction<BinanceConnector['useServerTime']> = jest.fn();
  getExchangeInfo: jest.MockedFunction<BinanceConnector['getExchangeInfo']> = jest.fn();
}
