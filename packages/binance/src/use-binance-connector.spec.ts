import { firstValueFrom } from 'rxjs';

import { makeTestModule, provider } from '@quantform/core';

import { BinanceConnector } from '@lib/binance-connector';
import { useBinanceConnector } from '@lib/use-binance-connector';

describe(useBinanceConnector.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('create instance of connector', async () => {
    await fixtures.whenUseBinanceConnectorCalled();
    fixtures.thenUseServerTimeRequestedOnce();
  });

  test('share connector instance between multiple requests', async () => {
    const [a, b, c] = await Promise.all([
      fixtures.whenUseBinanceConnectorCalled(),
      fixtures.whenUseBinanceConnectorCalled(),
      fixtures.whenUseBinanceConnectorCalled()
    ]);

    expect(Object.is(a, b)).toBeTruthy();
    expect(Object.is(b, c)).toBeTruthy();
    fixtures.thenUseServerTimeRequestedOnce();
  });
});

async function getFixtures() {
  const { act, get } = await makeTestModule([
    { provide: BinanceConnector, useClass: BinanceConnectorMock }
  ]);

  const connector = get(BinanceConnector) as unknown as BinanceConnectorMock;

  return {
    whenUseBinanceConnectorCalled: async () => {
      await act(() => firstValueFrom(useBinanceConnector()));
    },
    thenUseServerTimeRequestedOnce: () => {
      expect(connector.useServerTime).toHaveBeenCalledTimes(1);
    }
  };
}

@provider()
class BinanceConnectorMock implements Pick<BinanceConnector, 'useServerTime'> {
  useServerTime: jest.MockedFunction<BinanceConnector['useServerTime']> = jest.fn();
}
