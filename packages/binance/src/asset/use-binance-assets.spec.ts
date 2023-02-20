import { readFileSync } from 'fs';
import { join } from 'path';
import { firstValueFrom } from 'rxjs';

import { makeTestModule, provider } from '@quantform/core';

import { useBinanceAssets } from './use-binance-assets';

function readMockObject(fileName: string) {
  return Promise.resolve(
    JSON.parse(readFileSync(join(__dirname, '../_MOCK_', fileName), 'utf8'))
  );
}
/*
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
  const { act, get } = await makeTestModule([]);

  return {
    givenGetExchangeInfoResponse: (response: any) => {},
    givenGetAccountResponse: (response: any) => {},
    whenUseBinanceAssetsCalled: async () => act(() => firstValueFrom(useBinanceAssets())),
    thenGetExchangeInfoRequestedOnce: () => {},
    thenGetAccountRequestedOnce: () => {}
  };
}
*/
