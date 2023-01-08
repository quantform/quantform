import { firstValueFrom } from 'rxjs';

import { Module, provider } from '@quantform/core';

import { BinanceConnector } from '@lib/binance-connector';
import { useBinanceConnector } from '@lib/use-binance-connector';

describe(useBinanceConnector.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('initialize connector when requested', async () => {
    await fixtures.whenRequested();
    fixtures.thenUseServerTimeCalledOnce();
  });

  test('initialize connector once for multiple requests', async () => {
    await fixtures.whenRequested();
    await fixtures.whenRequested();
    await fixtures.whenRequested();
    fixtures.thenUseServerTimeCalledOnce();
  });
});

async function getFixtures() {
  const module = new Module({
    dependencies: [{ provide: BinanceConnector, useClass: BinanceConnectorMock }]
  });

  await module.awake();

  const connector = module.get(BinanceConnector) as unknown as BinanceConnectorMock;

  return {
    whenRequested: async () => {
      await module.executeUsingModule(async () => {
        await firstValueFrom(useBinanceConnector());
      });
    },
    thenUseServerTimeCalledOnce: () => {
      expect(connector.useServerTime).toHaveBeenCalledTimes(1);
    }
  };
}

@provider()
class BinanceConnectorMock implements Pick<BinanceConnector, 'useServerTime'> {
  useServerTime: jest.MockedFunction<BinanceConnector['useServerTime']> = jest.fn();
}
