import { readFileSync } from 'fs';
import { join } from 'path';
import { firstValueFrom } from 'rxjs';

import {
  d,
  instrumentOf,
  InstrumentSelector,
  makeTestModule,
  provider
} from '@quantform/core';

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
    fixtures.givenGetAccountResponse(readMockObject('binance-account-response.json'));

    const btc_usdt = await fixtures.whenUseBinanceInstrumentCalled(
      instrumentOf('binance:btc-usdt')
    );
    const eth_usdt = await fixtures.whenUseBinanceInstrumentCalled(
      instrumentOf('binance:eth-usdt')
    );

    expect(btc_usdt).toEqual(
      expect.objectContaining({
        base: expect.objectContaining({
          scale: 5
        }),
        commission: {
          makerRate: d(0.1),
          takerRate: d(0.1)
        }
      })
    );
    expect(eth_usdt).toEqual(
      expect.objectContaining({
        base: expect.objectContaining({
          scale: 4
        }),
        commission: {
          makerRate: d(0.1),
          takerRate: d(0.1)
        }
      })
    );
    fixtures.thenGetExchangeInfoRequestedOnce();
  });

  test('return instrument not supported for missing instrument', async () => {
    fixtures.givenGetExchangeInfoResponse(
      readMockObject('binance-exchange-info-response.json')
    );
    fixtures.givenGetAccountResponse(readMockObject('binance-account-response.json'));

    const btc_usdt = await fixtures.whenUseBinanceInstrumentCalled(
      instrumentOf('binance:nonexisting-usdt')
    );

    expect(btc_usdt).toEqual(instrumentNotSupported);
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
    whenUseBinanceInstrumentCalled: async (instrument: InstrumentSelector) =>
      act(() => firstValueFrom(useBinanceInstrument(instrument))),
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
