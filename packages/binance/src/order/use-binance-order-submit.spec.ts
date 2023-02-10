import { delay, Observable, of } from 'rxjs';
import waitForExpect from 'wait-for-expect';

import { instrumentFixtures } from '@lib/instrument/instrument.fixtures';
import {
  d,
  decimal,
  Instrument,
  makeTestModule,
  mockFunc,
  useTimestamp
} from '@quantform/core';

import { useBinanceOrderSubmit } from './use-binance-order-submit';
import { useBinanceOrderSubmitCommand } from './use-binance-order-submit-command';

jest.mock('./use-binance-order-submit-command', () => ({
  ...jest.requireActual('./use-binance-order-submit-command'),
  useBinanceOrderSubmitCommand: jest.fn()
}));

jest.mock('@quantform/core', () => ({
  ...jest.requireActual('@quantform/core'),
  useTimestamp: jest.fn()
}));

describe(useBinanceOrderSubmit.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('order submitted, sequence of changes emitted', async () => {
    const { act, instruments } = fixtures;

    await act(async () => {
      const submit = fixtures.whenOrderSubmitted(instruments.btc_usdt, d(1), d(10000));

      await fixtures.thenChangesEmitted(submit, [
        expect.objectContaining({ quantity: d(1), rate: d(10000), cancelable: false }),
        expect.objectContaining({ cancelable: true })
      ]);
    });
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  mockFunc(useBinanceOrderSubmitCommand).mockReturnValue(of({}));

  let timestamp = 1;

  mockFunc(useTimestamp).mockImplementation(() => timestamp++);

  return {
    act,
    instruments: instrumentFixtures,
    whenOrderSubmitted: (instrument: Instrument, quantity: decimal, rate?: decimal) => {
      const { submit } = useBinanceOrderSubmit(instrument);

      return submit({ quantity, rate });
    },
    thenChangesEmitted: async <T>(input: Observable<T>, events: Partial<T>[]) => {
      const changes = Array.of<T>();

      const subscription = input.subscribe(it => changes.push({ ...it }));

      await waitForExpect(() => expect(changes).toEqual(events));

      subscription.unsubscribe();
    }
  };
}
