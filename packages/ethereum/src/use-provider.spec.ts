import * as useOptions from '@lib/use-options';
import { EthereumOptions } from '@lib/use-options';
import { makeTestModule } from '@quantform/core';

import { useProvider } from './use-provider';

describe(useProvider.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test.each(['', undefined])('throws in case of missing rpc wss address', async wss => {
    fixtures.givenOptions({ rpc: { wss } });

    async function throws() {
      await fixtures.whenProviderResolved();
    }

    await expect(throws).rejects.toThrow();
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  return {
    givenOptions(options: Partial<EthereumOptions>) {
      jest.spyOn(useOptions, 'useOptions').mockReturnValue(options as any);
    },
    whenProviderResolved() {
      return act(() => useProvider());
    }
  };
}
