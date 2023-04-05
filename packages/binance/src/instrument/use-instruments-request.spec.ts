import { of, tap } from 'rxjs';
import waitForExpect from 'wait-for-expect';

import * as useBinanceRequest from '@lib/use-binance-request';
import { makeTestModule } from '@quantform/core';

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

  test('pipe a response from cache', async () => {
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
        .spyOn(useBinanceRequest, 'useBinanceRequest')
        .mockReturnValue(of({ timestamp, payload }));
    },
    whenRequestResolved() {
      const array = Array.of<any>();

      act(() => useInstrumentsRequest())
        .pipe(tap(it => array.push(it)))
        .subscribe();

      return array;
    }
  };
}
