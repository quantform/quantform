import { join } from 'path';
import { encode } from 'querystring';
import { firstValueFrom, of } from 'rxjs';

import { makeTestModule, mockFunc, useRequest } from '@quantform/core';

import { BinanceOptions } from './use-binance-options';
import { useBinanceRequest } from './use-binance-request';

jest.mock('@quantform/core', () => ({
  ...jest.requireActual('@quantform/core'),
  useRequest: jest.fn()
}));

describe(useBinanceRequest.name, () => {
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
    fixtures.thenRequestSigned(method, patch, query, signature);
  });
});

async function getFixtures() {
  const options = {
    apiKey: 'vmPUZE6mv9SD5VNHk4HlWFsOr6aKE2zvsw0MuIgwCIPy6utIco14y7Ju91duEh8A',
    apiSecret: 'NhqPtmdSJYdKjVHjA7PZj4Mge3R5YNiP1e3UZjInClVN65XAbvqqM6A7H5fATj0j'
  } as BinanceOptions;

  const { act } = await makeTestModule([
    {
      provide: BinanceOptions,
      useValue: options
    }
  ]);

  mockFunc(useRequest).mockReturnValueOnce(of({}));

  return {
    givenRequestArguments() {
      return {
        method: 'POST',
        patch: '/api/v3/order',
        query: {
          symbol: 'LTCBTC',
          side: 'BUY',
          type: 'LIMIT',
          timeInForce: 'GTC',
          quantity: 1,
          price: 0.1,
          recvWindow: 5000,
          timestamp: 1499827319559
        },
        signature: 'c8db56825ae71d6d79447849e617115f4a920fa2acdcab2b053c4b2838bd6b71'
      };
    },
    givenOptions(opts: { apiKey: string; apiSecret: string }) {
      options.apiKey = opts.apiKey;
      options.apiSecret = opts.apiSecret;
    },
    whenRequesting(
      method: string,
      patch: string,
      query: Record<string, string | number>
    ) {
      return act(() =>
        firstValueFrom(useBinanceRequest<unknown>({ method, patch, query }))
      );
    },
    thenRequestSigned(
      method: string,
      patch: string,
      query: Record<string, string | number>,
      signature: string
    ) {
      expect(useRequest).toBeCalledWith({
        method,
        url: `${join('https:/api.binance.com/', patch)}?${encode({
          ...query,
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
