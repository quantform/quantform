import { readFileSync } from 'fs';
import { join } from 'path';
import { firstValueFrom } from 'rxjs';

import { instrumentOf, InstrumentSelector, Module, provider } from '@quantform/core';

import { BinanceConnector } from '@lib/binance-connector';
import {
  instrumentNotSupported,
  useBinanceInstrument
} from '@lib/use-binance-instrument';

function readMockObject(fileName: string) {
  return Promise.resolve(
    JSON.parse(readFileSync(join(__dirname, '_MOCK_', fileName), 'utf8'))
  );
}

describe(useBinanceInstrument.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('return existing instruments', async () => {
    fixtures.givenGetExchangeInfoResponse(
      readMockObject('binance-exchange-info-response.json')
    );
    const btc_usdt = await fixtures.whenRequested(instrumentOf('binance:btc-usdt'));
    const eth_usdt = await fixtures.whenRequested(instrumentOf('binance:eth-usdt'));

    fixtures.thenGetExchangeInfoCalledOnce();
    expect(btc_usdt).toEqual(
      expect.objectContaining({
        base: expect.objectContaining({
          scale: 5
        })
      })
    );
    expect(eth_usdt).toEqual(
      expect.objectContaining({
        base: expect.objectContaining({
          scale: 4
        })
      })
    );
  });

  test('return instrument not supported for missing instrument', async () => {
    fixtures.givenGetExchangeInfoResponse(
      readMockObject('binance-exchange-info-response.json')
    );
    const btcusdt = await fixtures.whenRequested(
      instrumentOf('binance:nonexisting-usdt')
    );

    expect(btcusdt).toEqual(instrumentNotSupported);
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
    whenRequested: async (instrument: InstrumentSelector) =>
      await module.executeUsingModule(
        async () => await firstValueFrom(useBinanceInstrument(instrument))
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
