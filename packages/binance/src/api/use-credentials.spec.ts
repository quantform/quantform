import * as useOptions from '@lib/use-options';
import { BinanceOptions } from '@lib/use-options';
import { makeTestModule } from '@quantform/core';

import { useCredentials } from './use-credentials';

describe(useCredentials.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('happy patch', async () => {
    fixtures.givenOptions({ apiKey: 'api-key', apiSecret: 'api-secret' });

    const changes = await fixtures.whenCredentialsResolved();

    expect(changes).toEqual({
      apiKey: 'api-key',
      apiSecret: 'api-secret'
    });
  });

  test.each<[string?, string?]>([
    ['api-key', ''],
    ['api-key', undefined],
    ['', 'api-secret'],
    [undefined, 'api-secret'],
    ['', ''],
    [undefined, undefined]
  ])('throws in case of missing api or secret keys', async (apiKey, apiSecret) => {
    fixtures.givenOptions({ apiKey, apiSecret });

    async function throws() {
      await fixtures.whenCredentialsResolved();
    }

    await expect(throws).rejects.toThrow();
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  return {
    givenOptions(options: Partial<BinanceOptions>) {
      jest.spyOn(useOptions, 'useOptions').mockReturnValue(options as any);
    },
    whenCredentialsResolved() {
      return act(() => useCredentials());
    }
  };
}
