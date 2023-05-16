import { join } from 'path';
import { encode } from 'querystring';
import { firstValueFrom, of } from 'rxjs';

import { makeTestModule, mockedFunc, RequestMethod, useTimestamp } from '@quantform/core';

import { BinanceOptions } from './use-options';
import { withRequest } from './with-request';
import { withSignedRequest } from './with-signed-request';

jest.mock('@quantform/core', () => ({
  ...jest.requireActual('@quantform/core'),
  useRequest: jest.fn(),
  useTimestamp: jest.fn()
}));

describe(withSignedRequest.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('send signed request', async () => {
    const { method, patch, query, signature } = fixtures.givenRequestArguments();
    fixtures.givenOptions({
      apiKey: 'vmPUZE6mv9SD5VNHk4HlWFsOr6aKE2zvsw0MuIgwCIPy6utIco14y7Ju91duEh8A',
      apiSecret: 'NhqPtmdSJYdKjVHjA7PZj4Mge3R5YNiP1e3UZjInClVN65XAbvqqM6A7H5fATj0j'
    });
    fixtures.whenRequesting(method, patch, query);
    fixtures.thenSignedRequestSent(method, patch, query, signature);
  });
});

async function getFixtures() {
  const options = {
    apiKey: 'vmPUZE6mv9SD5VNHk4HlWFsOr6aKE2zvsw0MuIgwCIPy6utIco14y7Ju91duEh8A',
    apiSecret: 'NhqPtmdSJYdKjVHjA7PZj4Mge3R5YNiP1e3UZjInClVN65XAbvqqM6A7H5fATj0j',
    apiUrl: 'https://api.binance.com',
    recvWindow: 5000
  } as BinanceOptions;

  const { act } = await makeTestModule([
    {
      provide: BinanceOptions,
      useValue: options
    }
  ]);

  mockedFunc(withRequest).mockReturnValueOnce(of({ timestamp: 0, payload: {} }));

  return {
    givenRequestArguments() {
      return {
        method: 'POST' as RequestMethod,
        patch: '/api/v3/order',
        query: {
          symbol: 'LTCBTC',
          side: 'BUY',
          type: 'LIMIT',
          timeInForce: 'GTC',
          quantity: 1,
          price: 0.1
        },
        signature: 'c8db56825ae71d6d79447849e617115f4a920fa2acdcab2b053c4b2838bd6b71'
      };
    },
    givenOptions(opts: { apiKey: string; apiSecret: string }) {
      options.apiKey = opts.apiKey;
      options.apiSecret = opts.apiSecret;

      mockedFunc(useTimestamp).mockReturnValue(1499827319559);
    },
    whenRequesting(
      method: RequestMethod,
      patch: string,
      query: Record<string, string | number>
    ) {
      return act(() => firstValueFrom(withSignedRequest({ method, patch, query })));
    },
    thenSignedRequestSent(
      method: string,
      patch: string,
      query: Record<string, string | number>,
      signature: string
    ) {
      expect(withRequest).toBeCalledWith({
        method,
        url: `${join('https:/api.binance.com/', patch)}?${encode({
          ...query,
          recvWindow: 5000,
          timestamp: 1499827319559,
          signature
        })}`,
        headers: {
          'X-MBX-APIKEY':
            'vmPUZE6mv9SD5VNHk4HlWFsOr6aKE2zvsw0MuIgwCIPy6utIco14y7Ju91duEh8A'
        }
      });
    }
  };
}
