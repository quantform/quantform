import { Observable, of, tap } from 'rxjs';
import waitForExpect from 'wait-for-expect';

import * as usePublicRequest from '@lib/use-public-request';
import { makeTestModule, toArray } from '@quantform/core';

import { useInstrumentsRequest } from './use-instruments-request';

describe(useInstrumentsRequest.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('pipe a response', async () => {
    fixtures.givenResponseReceived(1, { fake: 1 });

    const changes = fixtures.whenRequestResolved();

    await waitForExpect(() =>
      expect(changes).toEqual([{ timestamp: 1, payload: { fake: 1 } }])
    );
  });

  test('pipe a cached response', async () => {
    fixtures.givenResponseReceived(1, { fake: 1 });

    const changes1 = fixtures.whenRequestResolved();

    await waitForExpect(() =>
      expect(changes1).toEqual([{ timestamp: 1, payload: { fake: 1 } }])
    );

    fixtures.givenResponseReceived(2, { fake: 2 });

    const changes2 = fixtures.whenRequestResolved();

    await waitForExpect(() =>
      expect(changes2).toEqual([{ timestamp: 1, payload: { fake: 1 } }])
    );
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  return {
    givenResponseReceived(timestamp: number, payload: any) {
      jest
        .spyOn(usePublicRequest, 'usePublicRequest')
        .mockReturnValue(of({ timestamp, payload }));
    },
    whenRequestResolved() {
      return toArray(act(() => useInstrumentsRequest()));
    }
  };
}
